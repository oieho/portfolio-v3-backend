import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  MinLength,
  IsAlphanumeric,
} from 'class-validator';
import { Model, Types } from 'mongoose';

export class LoginUserDto {
  @IsString()
  userId: string;

  @IsString()
  password: string;
}

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsAlphanumeric()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  socialMedia: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsNotEmpty()
  joinDate: Date;

  modDate: Date;
}
