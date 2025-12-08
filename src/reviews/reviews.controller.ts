import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewResponseDto, ReviewsListResponseDto } from "./dto/review-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserDocument } from "../auth/schemas/user.schema";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Get all reviews for a game (public endpoint)
  @Get(":entryUid")
  async getReviews(@Param("entryUid") entryUid: string): Promise<ReviewsListResponseDto> {
    return this.reviewsService.getReviewsByEntryUid(entryUid);
  }

  // Create a new review (requires authentication)
  @Post(":entryUid")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param("entryUid") entryUid: string,
    @CurrentUser() user: UserDocument,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.createReview(
      entryUid,
      user._id.toString(),
      user.email,
      createReviewDto,
    );
  }

  // Get current user's review for a game (requires authentication)
  @Get(":entryUid/my-review")
  @UseGuards(JwtAuthGuard)
  async getMyReview(
    @Param("entryUid") entryUid: string,
    @CurrentUser() user: UserDocument,
  ): Promise<ReviewResponseDto | null> {
    return this.reviewsService.getUserReviewForGame(entryUid, user._id.toString());
  }

  // Update a review (requires authentication)
  @Put(":reviewId")
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param("reviewId") reviewId: string,
    @CurrentUser() user: UserDocument,
    @Body() updateReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.updateReview(
      reviewId,
      user._id.toString(),
      updateReviewDto,
    );
  }

  // Delete a review (requires authentication)
  @Delete(":reviewId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param("reviewId") reviewId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<void> {
    return this.reviewsService.deleteReview(reviewId, user._id.toString());
  }
}

