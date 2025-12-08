export interface JwtPayload {
  sub: string;  // User ID
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface RecentlyViewedGame {
  slug: string;
  coverImage?: string;
  viewedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  createdAt: Date;
  recentlyViewed?: RecentlyViewedGame[];
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}

