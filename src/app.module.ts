import { Module } from "@nestjs/common";
import { MongoModule } from "./database/mongo.module";
import { AuthModule } from "./auth/auth.module";
import { ReviewsModule } from "./reviews/reviews.module";

@Module({
  imports: [MongoModule, AuthModule, ReviewsModule],
})
export class AppModule {}


