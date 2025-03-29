import { IsString, IsOptional, IsEnum, MinLength, IsEmail, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../auth/dto/auth.dto';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole; 
}

export class UpdateUserRoleDto {
  @IsString()
  userId: number;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;
}