import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

interface RecentlyViewedGame {
  slug: string;
  coverImage?: string;
  viewedAt: Date;
}

interface WishlistItem {
  entryUid: string;
  addedAt: Date;
}

interface DownloadedGame {
  entryUid: string;
  downloadedAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [] })
  recentlyViewed: RecentlyViewedGame[];

  @Prop({ default: [] })
  wishlist: WishlistItem[];

  @Prop({ default: [] })
  downloads: DownloadedGame[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

