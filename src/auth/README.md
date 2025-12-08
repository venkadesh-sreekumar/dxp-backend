# Authentication Service

A complete JWT-based authentication system using NestJS, MongoDB, and Passport.

## Features

✅ User registration with email and password  
✅ Secure password hashing with bcrypt  
✅ JWT token generation and validation  
✅ Protected routes with JWT guards  
✅ User profile management  
✅ Recently viewed games tracking  
✅ Token verification endpoint  

## API Endpoints

### Public Endpoints

#### 1. Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "recentlyViewed": []
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "recentlyViewed": []
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints (Require JWT Token)

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

#### 3. Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "recentlyViewed": [
    {
      "slug": "game-slug",
      "coverImage": "https://example.com/image.jpg",
      "viewedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 4. Update Recently Viewed Games
```http
PATCH /api/auth/recently-viewed
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameSlug": "zelda-tears-of-the-kingdom",
  "coverImage": "https://example.com/zelda-cover.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "recentlyViewed": [...]
}
```

#### 5. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "recentlyViewed": []
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["password must be at least 6 characters long"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

## Usage in Other Modules

### Protecting Routes

Import the `JwtAuthGuard` in your controller:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../auth/schemas/user.schema';

@Controller('games')
export class GamesController {
  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  async getFavorites(@CurrentUser() user: UserDocument) {
    // user is automatically injected and validated
    return { userId: user._id, favorites: [] };
  }
}
```

### Accessing Auth Service

Import the `AuthModule` in your module:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MyController } from './my.controller';
import { MyService } from './my.service';

@Module({
  imports: [AuthModule],
  controllers: [MyController],
  providers: [MyService],
})
export class MyModule {}
```

Then inject the `AuthService`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MyService {
  constructor(private authService: AuthService) {}

  async getUserProfile(userId: string) {
    return this.authService.getProfile(userId);
  }
}
```

## Environment Variables

Required environment variables (see `env-sample.txt`):

```env
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/gamestore-dxp

# JWT configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Bcrypt configuration
BCRYPT_SALT_ROUNDS=10
```

## Security Best Practices

1. **Change JWT_SECRET in production**: Generate a strong random key
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use HTTPS in production**: Always use secure connections

3. **Set appropriate token expiration**: Balance security and user experience

4. **Rate limit authentication endpoints**: Prevent brute force attacks

5. **Store tokens securely on client**: Use httpOnly cookies or secure storage

## Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (use token from login response)
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman or Thunder Client

1. Create a new request
2. Set the method and URL
3. Add the JSON body (for POST/PATCH requests)
4. Add Authorization header with Bearer token (for protected routes)
5. Send the request

## Database Schema

### User Collection

```typescript
{
  email: string;           // Unique, lowercase, trimmed
  password: string;        // Bcrypt hashed
  recentlyViewed: [        // Array of recently viewed games
    {
      slug: string;
      coverImage?: string;
      viewedAt: Date;
    }
  ];
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-generated
}
```

## Architecture

```
auth/
├── schemas/
│   └── user.schema.ts          # MongoDB User model
├── dto/
│   ├── register.dto.ts         # Registration request validation
│   ├── login.dto.ts            # Login request validation
│   └── auth-response.dto.ts    # Response type definitions
├── strategies/
│   └── jwt.strategy.ts         # Passport JWT strategy
├── guards/
│   └── jwt-auth.guard.ts       # JWT authentication guard
├── decorators/
│   └── current-user.decorator.ts  # Extract user from request
├── auth.service.ts             # Business logic
├── auth.controller.ts          # REST API endpoints
└── auth.module.ts              # Module configuration
```

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Refresh token support
- [ ] OAuth2 integration (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Account lockout after failed login attempts
- [ ] Role-based access control (RBAC)
- [ ] Audit logging for security events

