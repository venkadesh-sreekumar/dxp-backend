import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Review, ReviewDocument } from "./schemas/review.schema";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewResponseDto, ReviewsListResponseDto } from "./dto/review-response.dto";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async createReview(
    entryUid: string,
    userId: string,
    userEmail: string,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Check if user already reviewed this game
    const existingReview = await this.reviewModel.findOne({ entryUid, userId });
    if (existingReview) {
      throw new ConflictException("You have already reviewed this game");
    }

    const review = new this.reviewModel({
      entryUid,
      userId,
      userEmail,
      ...createReviewDto,
    });

    const savedReview = await review.save();
    return this.toResponseDto(savedReview);
  }

  async getReviewsByEntryUid(entryUid: string): Promise<ReviewsListResponseDto> {
    const reviews = await this.reviewModel
      .find({ entryUid })
      .sort({ createdAt: -1 })
      .exec();

    const total = reviews.length;
    const averageRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    return {
      reviews: reviews.map((r) => this.toResponseDto(r)),
      total,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    };
  }

  async getUserReviewForGame(
    entryUid: string,
    userId: string,
  ): Promise<ReviewResponseDto | null> {
    const review = await this.reviewModel.findOne({ entryUid, userId });
    return review ? this.toResponseDto(review) : null;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("You can only edit your own reviews");
    }

    review.rating = updateDto.rating;
    review.title = updateDto.title;
    review.content = updateDto.content;
    review.updatedAt = new Date();

    const updatedReview = await review.save();
    return this.toResponseDto(updatedReview);
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    await this.reviewModel.findByIdAndDelete(reviewId);
  }

  private toResponseDto(review: ReviewDocument): ReviewResponseDto {
    return {
      id: review._id.toString(),
      entryUid: review.entryUid,
      userId: review.userId,
      userEmail: review.userEmail,
      rating: review.rating,
      title: review.title,
      content: review.content,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}

