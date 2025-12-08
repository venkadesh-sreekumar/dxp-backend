export class ReviewResponseDto {
  id: string;
  entryUid: string;
  userId: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewsListResponseDto {
  reviews: ReviewResponseDto[];
  total: number;
  averageRating: number;
}

