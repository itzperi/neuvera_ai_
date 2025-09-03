from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# User Models
class UserCreate(BaseModel):
    email: str
    password: str
    first_name: str = ""
    last_name: str = ""

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    first_name: str = ""
    last_name: str = ""
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    is_admin: bool

# Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: str
    message: str
    response: str
    timestamp: datetime

# Tracking Models
class TrackingEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    event_type: str
    page_url: str
    user_agent: str
    ip_address: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict = {}

class TrackingRequest(BaseModel):
    event_type: str
    page_url: str
    user_agent: str
    ip_address: str
    metadata: dict = {}

# Admin Models
class AdminStats(BaseModel):
    total_users: int
    total_chats: int
    total_events: int
    recent_activity: List[dict]

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def hash_identifier(identifier: str) -> str:
    return hashlib.sha256(identifier.encode()).hexdigest()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # In a real app, you'd verify JWT token here
        # For now, we'll use simple token lookup
        user = await db.users.find_one({"token": token})
        if user:
            return User(**user)
        raise HTTPException(status_code=401, detail="Invalid token")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Authentication Routes
@api_router.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    user_dict["token"] = str(uuid.uuid4())
    
    await db.users.insert_one(user_dict)
    
    return UserResponse(**user.dict())

@api_router.post("/auth/signin")
async def signin(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate new token
    token = str(uuid.uuid4())
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"token": token}})
    
    return {
        "token": token,
        "user": UserResponse(**user)
    }

@api_router.post("/auth/admin")
async def admin_login(login_data: UserLogin):
    if login_data.email == "neuvera" and login_data.password == "1234@07":
        # Create admin token
        admin_token = str(uuid.uuid4())
        admin_user = {
            "id": "admin",
            "email": "admin@neuvera.ai",
            "first_name": "Admin",
            "last_name": "User",
            "is_admin": True,
            "token": admin_token
        }
        
        # Store admin session
        await db.users.update_one(
            {"email": "admin@neuvera.ai"},
            {"$set": admin_user},
            upsert=True
        )
        
        return {
            "token": admin_token,
            "user": {
                "id": "admin",
                "email": "admin@neuvera.ai",
                "first_name": "Admin",
                "last_name": "User",
                "is_admin": True
            }
        }
    
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

# Chat Routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(chat_request: ChatRequest, current_user: User = Depends(get_current_user)):
    try:
        # Initialize Groq chat
        chat = LlmChat(
            api_key=os.environ.get('GROQ_API_KEY'),
            session_id=f"user_{current_user.id}",
            system_message="You are Neuvera, an advanced AI assistant comparable to Doraemon. You're intelligent, helpful, and capable of handling diverse tasks like academic support, exam preparation, and personalized problem-solving. Always be friendly, knowledgeable, and provide comprehensive assistance."
        ).with_model("groq", "llama-3.1-70b-versatile")
        
        # Create user message
        user_message = UserMessage(text=chat_request.message)
        
        # Send message and get response
        response = await chat.send_message(user_message)
        
        # Save chat to database
        chat_message = ChatMessage(
            user_id=current_user.id,
            message=chat_request.message,
            response=response
        )
        
        chat_dict = chat_message.dict()
        await db.chats.insert_one(chat_dict)
        
        return ChatResponse(**chat_message.dict())
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat service unavailable")

@api_router.get("/chat/history", response_model=List[ChatResponse])
async def get_chat_history(current_user: User = Depends(get_current_user)):
    chats = await db.chats.find({"user_id": current_user.id}).sort("timestamp", -1).limit(50).to_list(50)
    return [ChatResponse(**chat) for chat in chats]

# Tracking Routes
@api_router.post("/track")
async def track_event(tracking_data: TrackingRequest):
    try:
        # Hash sensitive data
        hashed_ip = hash_identifier(tracking_data.ip_address)
        
        event = TrackingEvent(
            event_type=tracking_data.event_type,
            page_url=tracking_data.page_url,
            user_agent=tracking_data.user_agent,
            ip_address=hashed_ip,
            metadata=tracking_data.metadata
        )
        
        event_dict = event.dict()
        await db.tracking_events.insert_one(event_dict)
        
        return {"status": "success", "event_id": event.id}
        
    except Exception as e:
        logger.error(f"Tracking error: {str(e)}")
        raise HTTPException(status_code=500, detail="Tracking failed")

# Admin Routes
@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get statistics
    total_users = await db.users.count_documents({})
    total_chats = await db.chats.count_documents({})
    total_events = await db.tracking_events.count_documents({})
    
    # Get recent activity
    recent_chats = await db.chats.find().sort("timestamp", -1).limit(10).to_list(10)
    recent_events = await db.tracking_events.find().sort("timestamp", -1).limit(10).to_list(10)
    
    recent_activity = []
    for chat in recent_chats:
        recent_activity.append({
            "type": "chat",
            "timestamp": chat["timestamp"].isoformat(),
            "user_id": chat["user_id"],
            "data": {"message": chat["message"][:50] + "..."}
        })
    
    for event in recent_events:
        recent_activity.append({
            "type": "event",
            "timestamp": event["timestamp"].isoformat(),
            "data": {"event_type": event["event_type"], "page_url": event["page_url"]}
        })
    
    # Sort by timestamp
    recent_activity.sort(key=lambda x: x["timestamp"], reverse=True)
    recent_activity = recent_activity[:20]
    
    return AdminStats(
        total_users=total_users,
        total_chats=total_chats,
        total_events=total_events,
        recent_activity=recent_activity
    )

@api_router.get("/admin/events")
async def get_tracking_events(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    events = await db.tracking_events.find().sort("timestamp", -1).limit(100).to_list(100)
    return events

# Health check
@api_router.get("/")
async def root():
    return {"message": "Neuvera.ai API is running", "status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()