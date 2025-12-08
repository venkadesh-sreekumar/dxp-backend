// Module
export { AuthModule } from "./auth.module";

// Service
export { AuthService } from "./auth.service";

// Controller
export { AuthController } from "./auth.controller";

// Guards
export { JwtAuthGuard } from "./guards/jwt-auth.guard";

// Decorators
export { CurrentUser } from "./decorators/current-user.decorator";

// Schemas
export { User, UserDocument, UserSchema } from "./schemas/user.schema";

// DTOs
export { RegisterDto } from "./dto/register.dto";
export { LoginDto } from "./dto/login.dto";
export { AuthResponseDto, UserResponseDto } from "./dto/auth-response.dto";

// Types
export * from "./types";

