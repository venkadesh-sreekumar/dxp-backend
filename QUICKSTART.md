# Backend Quick Start Guide

This guide will help you get the backend authentication service up and running.

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally, or a MongoDB Atlas account
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the sample:

```bash
cp env-sample.txt .env
```

Edit `.env` and update the values:

```env
# Server
PORT=4000
NODE_ENV=development

# MongoDB - Use one of these options:

# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/gamestore-dxp

# Option B: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gamestore-dxp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=10
```

**Important**: Generate a strong JWT secret for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start MongoDB (if using local)

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or run in foreground
mongod --dbpath /path/to/data
```

### 4. Build the Application

```bash
npm run build
```

### 5. Start the Server

Development mode (with hot reload):
```bash
npm run start:dev
```

Production mode:
```bash
npm start
```

The server will start at `http://localhost:4000/api`

## Verify Installation

Test the server is running:

```bash
curl http://localhost:4000/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "createdAt": "...",
    "recentlyViewed": []
  },
  "accessToken": "eyJhbGci..."
}
```

## Testing the Auth Endpoints

### 1. Register a User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

Save the `accessToken` from the response.

### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### 3. Get Profile (Protected Route)

```bash
export TOKEN="your_access_token_here"

curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Update Recently Viewed

```bash
curl -X PATCH http://localhost:4000/api/auth/recently-viewed \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gameSlug": "zelda-totk",
    "coverImage": "https://example.com/zelda.jpg"
  }'
```

### 5. Verify Token

```bash
curl -X GET http://localhost:4000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Integration

Use the token in your frontend requests:

```typescript
// Register/Login
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, user } = await response.json();

// Store token (localStorage, sessionStorage, or cookies)
localStorage.setItem('token', accessToken);

// Use token in subsequent requests
const profile = await fetch('http://localhost:4000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## Common Issues

### MongoDB Connection Failed

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
1. Check MongoDB is running: `brew services list` or `sudo systemctl status mongod`
2. Verify MONGODB_URI in `.env` is correct
3. For MongoDB Atlas, check:
   - IP whitelist includes your IP (or use 0.0.0.0/0 for testing)
   - Username and password are correct
   - Connection string format is correct

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
```

### JWT Verification Failed

**Error**: `401 Unauthorized`

**Solution**:
1. Check token is included in Authorization header
2. Format: `Authorization: Bearer <token>`
3. Token hasn't expired (default: 7 days)
4. JWT_SECRET in `.env` matches the one used to sign tokens

## Project Structure

```
backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── schemas/            # MongoDB schemas
│   │   ├── dto/                # Data transfer objects
│   │   ├── strategies/         # Passport strategies
│   │   ├── guards/             # Auth guards
│   │   ├── decorators/         # Custom decorators
│   │   ├── auth.service.ts     # Business logic
│   │   ├── auth.controller.ts  # API endpoints
│   │   └── auth.module.ts      # Module definition
│   ├── database/               # Database configuration
│   │   └── mongo.module.ts
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Entry point
├── .env                        # Environment variables
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

## Next Steps

1. **Set up CORS**: Update CORS settings in `main.ts` for your frontend URL
2. **Add validation**: Enhance DTOs with more validation rules
3. **Implement refresh tokens**: Add token refresh mechanism
4. **Add rate limiting**: Protect against brute force attacks
5. **Set up logging**: Add Winston or Pino for better logging
6. **Write tests**: Add unit and integration tests
7. **Deploy**: Deploy to AWS, Google Cloud, or your preferred platform

## API Documentation

See [auth/README.md](./src/auth/README.md) for complete API documentation.

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Test MongoDB connection separately
4. Check NestJS documentation: https://docs.nestjs.com/
5. Check Mongoose documentation: https://mongoosejs.com/

Happy coding! 🚀

