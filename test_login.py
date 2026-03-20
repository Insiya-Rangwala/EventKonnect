import requests

def test_login(email, password):
    url = "http://127.0.0.1:8000/api/users/login/"
    data = {
        "username": email,
        "password": password
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")

if __name__ == "__main__":
    # Test with some dummy credentials to see the error format
    test_login("admin@example.com", "password123")
