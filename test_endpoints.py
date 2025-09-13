#!/usr/bin/env python3
"""
Simple test script to verify PDF editor endpoints
"""
import requests
import os

BASE_URL = "http://127.0.0.1:5000"

def test_endpoints():
    print("Testing PDF Editor Endpoints...")
    
    # Test 1: Check if server is running
    try:
        response = requests.get(BASE_URL)
        print(f"✅ Server is running: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Please start the Flask app first.")
        return
    
    # Test 2: Check if we have any uploaded files
    uploads_dir = "uploads"
    if os.path.exists(uploads_dir) and os.listdir(uploads_dir):
        test_file = os.listdir(uploads_dir)[0]
        print(f"📄 Found test file: {test_file}")
        
        # Test extract_text endpoint
        try:
            response = requests.get(f"{BASE_URL}/extract_text/{test_file}")
            if response.status_code == 200:
                print("✅ extract_text endpoint working")
            else:
                print(f"❌ extract_text failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ extract_text error: {e}")
        
        # Test get_text_blocks endpoint
        try:
            response = requests.get(f"{BASE_URL}/get_text_blocks/{test_file}")
            if response.status_code == 200:
                print("✅ get_text_blocks endpoint working")
            else:
                print(f"❌ get_text_blocks failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ get_text_blocks error: {e}")
        
        # Test preview endpoint
        try:
            response = requests.get(f"{BASE_URL}/preview/{test_file}")
            if response.status_code == 200:
                print("✅ preview endpoint working")
            else:
                print(f"❌ preview failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ preview error: {e}")
    
    else:
        print("📁 No test files found. Upload a PDF first to test endpoints.")

if __name__ == "__main__":
    test_endpoints()