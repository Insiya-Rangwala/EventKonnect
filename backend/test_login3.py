import requests

url = "http://127.0.0.1:8000/api/users/login/"

for user in [("organizer@example.com", "password123"), ("attendee@example.com", "password123")]:
    data = {"username": user[0], "password": user[1]}
    response = requests.post(url, json=data)
    print(f"Login Response for {user[0]}: {response.text}")
