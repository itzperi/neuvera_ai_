import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { Switch } from './components/ui/switch';
import { Separator } from './components/ui/separator';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { 
  Brain, 
  MessageCircle, 
  User, 
  Settings, 
  Sun, 
  Moon, 
  Send, 
  Sparkles, 
  Shield, 
  Zap, 
  Star,
  Activity,
  Users,
  Eye,
  BarChart3,
  LogOut
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme Context
const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('neuvera-theme');
    if (stored === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('neuvera-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('neuvera-theme', 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Landing Page Component
const LandingPage = ({ onAuthOpen, onAdminOpen }) => {
  const { isDark, toggleTheme } = React.useContext(ThemeContext);

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        await axios.post(`${API}/track`, {
          event_type: 'page_view',
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          ip_address: 'client_ip',
          metadata: { page: 'landing' }
        });
      } catch (error) {
        console.log('Tracking error:', error);
      }
    };
    
    trackPageView();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={onAdminOpen}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Neuvera.ai
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={onAuthOpen}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Your AI Companion
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Meet Your
                  <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                    Digital Doraemon
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                  Experience the future of AI assistance. Neuvera.ai handles everything from academic support 
                  to personalized problem-solving with the intelligence of tomorrow.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={onAuthOpen}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Try Neuvera
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-6 text-lg rounded-xl"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-3 gap-6 pt-8">
                {[
                  { icon: Shield, title: "Secure", desc: "Privacy-first AI" },
                  { icon: Zap, title: "Fast", desc: "Instant responses" },
                  { icon: Brain, title: "Smart", desc: "Advanced reasoning" }
                ].map((feature, i) => (
                  <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <feature.icon className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">You</p>
                          <p className="text-sm text-slate-500">Just now</p>
                        </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                        <p>Help me prepare for my calculus exam tomorrow</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Neuvera</p>
                          <p className="text-sm text-slate-500">AI Assistant</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl p-4">
                        <p>I'll create a personalized study plan! Let's start with derivatives and work through practice problems together. What specific topics are you struggling with?</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-3xl blur-3xl"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full opacity-60 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-40 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Authentication Component
const AuthDialog = ({ open, onOpenChange, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/signin' : '/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName
          };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      if (response.data.token) {
        localStorage.setItem('neuvera-token', response.data.token);
        localStorage.setItem('neuvera-user', JSON.stringify(response.data.user));
        toast.success(`${isLogin ? 'Welcome back!' : 'Welcome to Neuvera!'}`);
        onAuthSuccess(response.data.user);
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isLogin ? 'Welcome Back' : 'Join Neuvera'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLogin ? 'Sign in to continue your AI journey' : 'Create your account to get started'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Chat Interface Component
const ChatInterface = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isDark, toggleTheme } = React.useContext(ThemeContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('neuvera-token');
      const response = await axios.get(`${API}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      message: userMessage,
      response: '',
      timestamp: new Date(),
      isLoading: true
    }]);

    try {
      const token = localStorage.getItem('neuvera-token');
      const response = await axios.post(`${API}/chat`, 
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => prev.map(msg => 
        msg.isLoading ? { ...response.data, isLoading: false } : msg
      ));
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(msg => !msg.isLoading));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Neuvera.ai</h1>
              <p className="text-sm text-slate-500">Your AI Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {user.first_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex flex-col h-screen pt-20">
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <Brain className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
                <h2 className="text-2xl font-bold mb-2">Hello, {user.first_name || 'there'}!</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  I'm Neuvera, your AI companion. How can I help you today?
                </p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-lg">
                    <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                      <CardContent className="p-4">
                        <p>{msg.message}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* AI Response */}
                {(msg.response || msg.isLoading) && (
                  <div className="flex justify-start">
                    <div className="max-w-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <Card className="flex-1">
                          <CardContent className="p-4">
                            {msg.isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.response}</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <Input
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('neuvera-admin-token');
      const [statsResponse, eventsResponse] = await Promise.all([
        axios.get(`${API}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/events`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(statsResponse.data);
      setEvents(eventsResponse.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={onClose}>
            <LogOut className="w-4 h-4 mr-2" />
            Exit Admin
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_chats || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracking Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_events || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {stats?.recent_activity?.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <div className="flex items-center space-x-3">
                      {activity.type === 'chat' ? (
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm">
                        {activity.type === 'chat' ? 'Chat Message' : activity.data.event_type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Tracking Events */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {events.map((event, i) => (
                  <div key={i} className="p-3 border rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{event.event_type}</Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {event.page_url}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin Login Dialog
const AdminLoginDialog = ({ open, onOpenChange, onAdminSuccess }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/auth/admin`, credentials);
      
      if (response.data.token) {
        localStorage.setItem('neuvera-admin-token', response.data.token);
        toast.success('Admin access granted');
        onAdminSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Admin Access</DialogTitle>
          <DialogDescription className="text-center">
            Enter admin credentials to access the admin panel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Username"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  useEffect(() => {
    // Check for existing auth
    const token = localStorage.getItem('neuvera-token');
    const userData = localStorage.getItem('neuvera-user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('chat');
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setCurrentView('chat');
  };

  const handleAdminSuccess = () => {
    setCurrentView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('neuvera-token');
    localStorage.removeItem('neuvera-user');
    setUser(null);
    setCurrentView('landing');
    toast.success('Logged out successfully');
  };

  const handleAdminExit = () => {
    localStorage.removeItem('neuvera-admin-token');
    setCurrentView('landing');
  };

  return (
    <ThemeProvider>
      <div className="App">
        <Toaster position="top-right" />
        
        {currentView === 'landing' && (
          <LandingPage 
            onAuthOpen={() => setAuthDialogOpen(true)}
            onAdminOpen={() => setAdminDialogOpen(true)}
          />
        )}
        
        {currentView === 'chat' && user && (
          <ChatInterface user={user} onLogout={handleLogout} />
        )}
        
        {currentView === 'admin' && (
          <AdminPanel onClose={handleAdminExit} />
        )}

        <AuthDialog 
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onAuthSuccess={handleAuthSuccess}
        />

        <AdminLoginDialog
          open={adminDialogOpen}
          onOpenChange={setAdminDialogOpen}
          onAdminSuccess={handleAdminSuccess}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;