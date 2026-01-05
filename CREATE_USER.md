# How to Create a User Account

Since there are no default login credentials, you need to create a user account first using the API.

## Method 1: Using PowerShell (Windows)

Open PowerShell and run:

```powershell
$body = @{
    fullname = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "rider"
    phone = "1234567890"
    address = "Test Address"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

Or for a passenger:

```powershell
$body = @{
    fullname = "Test Passenger"
    email = "passenger@example.com"
    password = "password123"
    role = "passenger"
    phone = "1234567890"
    address = "Test Address"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

## Method 2: Using curl (if available)

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "rider",
    "phone": "1234567890",
    "address": "Test Address"
  }'
```

## Method 3: Using Postman or Thunder Client

1. Create a new POST request
2. URL: `http://localhost:3000/auth/signup`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "fullname": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "rider",
  "phone": "1234567890",
  "address": "Test Address"
}
```

## Available Roles

- `"rider"` - User who offers rides
- `"passenger"` - User who requests rides

## After Creating Account

Once you've created an account, you can login at `http://localhost:5173/login` using:
- **Email**: The email you used in signup
- **Password**: The password you set

## Note

Make sure your backend server is running on `http://localhost:3000` before creating the account.

