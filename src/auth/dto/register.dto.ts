import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from "class-validator";

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;
}

