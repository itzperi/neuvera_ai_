import requests
import sys
import json
from datetime import datetime
import time

class NeuveraAPITester:
    def __init__(self, base_url="https://ai-companion-211.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
        self.test_user_password = "TestPass123!"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        
        # Setup headers
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        
        # Add authentication if available
        if use_admin and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.user_token and not use_admin:
            test_headers['Authorization'] = f'Bearer {self.user_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_user_signup(self):
        """Test user signup"""
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_user_password,
                "first_name": "Test",
                "last_name": "User"
            }
        )
        return success

    def test_user_signin(self):
        """Test user signin and get token"""
        success, response = self.run_test(
            "User Signin",
            "POST",
            "auth/signin",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_user_password
            }
        )
        if success and 'token' in response:
            self.user_token = response['token']
            print(f"   User token obtained: {self.user_token[:20]}...")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/admin",
            200,
            data={
                "email": "neuvera",
                "password": "1234@07"
            }
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_chat_message(self):
        """Test sending a chat message"""
        if not self.user_token:
            print("❌ Skipping chat test - no user token")
            return False
            
        success, response = self.run_test(
            "Send Chat Message",
            "POST",
            "chat",
            200,
            data={"message": "Hello, this is a test message. Please respond briefly."}
        )
        
        if success:
            print(f"   AI Response: {response.get('response', 'No response')[:100]}...")
            return True
        return False

    def test_chat_history(self):
        """Test getting chat history"""
        if not self.user_token:
            print("❌ Skipping chat history test - no user token")
            return False
            
        success, response = self.run_test(
            "Get Chat History",
            "GET",
            "chat/history",
            200
        )
        
        if success:
            print(f"   Chat history items: {len(response)}")
            return True
        return False

    def test_tracking_event(self):
        """Test tracking event"""
        success, response = self.run_test(
            "Track Event",
            "POST",
            "track",
            200,
            data={
                "event_type": "test_event",
                "page_url": "https://test.com",
                "user_agent": "Test Agent",
                "ip_address": "127.0.0.1",
                "metadata": {"test": "data"}
            }
        )
        return success

    def test_admin_stats(self):
        """Test admin statistics"""
        if not self.admin_token:
            print("❌ Skipping admin stats test - no admin token")
            return False
            
        success, response = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200,
            use_admin=True
        )
        
        if success:
            print(f"   Total users: {response.get('total_users', 0)}")
            print(f"   Total chats: {response.get('total_chats', 0)}")
            print(f"   Total events: {response.get('total_events', 0)}")
            return True
        return False

    def test_admin_events(self):
        """Test admin tracking events"""
        if not self.admin_token:
            print("❌ Skipping admin events test - no admin token")
            return False
            
        success, response = self.run_test(
            "Get Admin Events",
            "GET",
            "admin/events",
            200,
            use_admin=True
        )
        
        if success:
            print(f"   Tracking events retrieved: {len(response)}")
            return True
        return False

def main():
    print("🚀 Starting Neuvera.ai API Testing...")
    print("=" * 50)
    
    tester = NeuveraAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Signup", tester.test_user_signup),
        ("User Signin", tester.test_user_signin),
        ("Admin Login", tester.test_admin_login),
        ("Tracking Event", tester.test_tracking_event),
        ("Chat Message", tester.test_chat_message),
        ("Chat History", tester.test_chat_history),
        ("Admin Stats", tester.test_admin_stats),
        ("Admin Events", tester.test_admin_events),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            failed_tests.append(test_name)
        
        # Small delay between tests
        time.sleep(1)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print(f"\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())