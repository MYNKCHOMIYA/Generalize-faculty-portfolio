import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZDIxZTIzNCIsImV4cCI6MTcxMjMzMzMzM30.xxx"  # just a dummy
headers = {"Authorization": f"Bearer {token}"}
r = requests.get(
    "http://localhost:8000/api/v1/export/cv/cb7297ee-68b1-46ac-8e3e-7affe8ca5f99",
    headers=headers,
)
print(r.status_code)
print(r.text)
