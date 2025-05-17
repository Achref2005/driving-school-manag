
import requests
import sys
import json
from datetime import datetime

class DrivingSchoolAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_data = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self, username, password):
        """Test login and get token"""
        success, response = self.run_test(
            "Login",
            "POST",
            "auth/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            return True
        return False

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        return self.run_test(
            "Dashboard Statistics",
            "GET",
            "dashboard/stats",
            200
        )

    def test_courses(self):
        """Test courses endpoint"""
        return self.run_test(
            "Courses List",
            "GET",
            "courses",
            200
        )

    def test_instructors(self):
        """Test instructors endpoint"""
        return self.run_test(
            "Instructors List",
            "GET",
            "instructors",
            200
        )

    def test_students(self):
        """Test students endpoint"""
        return self.run_test(
            "Students List",
            "GET",
            "students",
            200
        )

    def test_vehicles(self):
        """Test vehicles endpoint"""
        return self.run_test(
            "Vehicles List",
            "GET",
            "vehicles",
            200
        )

def main():
    # Get the backend URL from the frontend .env file
    backend_url = "https://35e69a63-7574-4696-8851-af74b66e1304.preview.emergentagent.com"
    
    # Setup
    tester = DrivingSchoolAPITester(backend_url)
    
    # Test root endpoint (no auth required)
    tester.test_root_endpoint()
    
    # Test login
    if not tester.test_login("admin", "password"):
        print("❌ Login failed, stopping tests")
        return 1
    
    print(f"\n✅ Successfully logged in as: {tester.user_data['username']} (Role: {tester.user_data['role']})")
    
    # Test authenticated endpoints
    tester.test_dashboard_stats()
    tester.test_courses()
    tester.test_instructors()
    tester.test_students()
    tester.test_vehicles()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
