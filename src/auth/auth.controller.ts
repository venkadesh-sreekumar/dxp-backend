import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Patch,
  Delete,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto, UserResponseDto } from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UserDocument } from "./schemas/user.schema";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserDocument): Promise<UserResponseDto> {
    return this.authService.getProfile(user._id.toString());
  }

  @Patch("recently-viewed")
  @UseGuards(JwtAuthGuard)
  async updateRecentlyViewed(
    @CurrentUser() user: UserDocument,
    @Body() body: { gameSlug: string; coverImage?: string },
  ): Promise<UserResponseDto> {
    return this.authService.updateRecentlyViewed(
      user._id.toString(),
      body.gameSlug,
      body.coverImage,
    );
  }

  @Get("verify")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@CurrentUser() user: UserDocument): Promise<{ valid: boolean; user: UserResponseDto }> {
    return {
      valid: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
        recentlyViewed: user.recentlyViewed || [],
        wishlist: user.wishlist?.map((item) => item.entryUid) || [],
        downloads: user.downloads?.map((item) => item.entryUid) || [],
      },
    };
  }

  @Post("wishlist/:entryUid")
  @UseGuards(JwtAuthGuard)
  async addToWishlist(
    @CurrentUser() user: UserDocument,
    @Body() body: { entryUid: string },
  ): Promise<UserResponseDto> {
    return this.authService.addToWishlist(user._id.toString(), body.entryUid);
  }

  @Delete("wishlist/:entryUid")
  @UseGuards(JwtAuthGuard)
  async removeFromWishlist(
    @CurrentUser() user: UserDocument,
    @Body() body: { entryUid: string },
  ): Promise<UserResponseDto> {
    return this.authService.removeFromWishlist(user._id.toString(), body.entryUid);
  }

  @Get("wishlist")
  @UseGuards(JwtAuthGuard)
  async getWishlist(@CurrentUser() user: UserDocument): Promise<{ wishlist: string[] }> {
    const wishlist = await this.authService.getWishlist(user._id.toString());
    return { wishlist };
  }

  @Post("downloads/:entryUid")
  @UseGuards(JwtAuthGuard)
  async addToDownloads(
    @CurrentUser() user: UserDocument,
    @Body() body: { entryUid: string },
  ): Promise<UserResponseDto> {
    return this.authService.addToDownloads(user._id.toString(), body.entryUid);
  }

  @Delete("downloads/:entryUid")
  @UseGuards(JwtAuthGuard)
  async removeFromDownloads(
    @CurrentUser() user: UserDocument,
    @Body() body: { entryUid: string },
  ): Promise<UserResponseDto> {
    return this.authService.removeFromDownloads(user._id.toString(), body.entryUid);
  }

  @Get("downloads")
  @UseGuards(JwtAuthGuard)
  async getDownloads(@CurrentUser() user: UserDocument): Promise<{ downloads: string[] }> {
    const downloads = await this.authService.getDownloads(user._id.toString());
    return { downloads };
  }
}

