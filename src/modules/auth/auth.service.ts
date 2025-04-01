import { BadRequestException, Injectable,InternalServerErrorException,Logger,UnauthorizedException  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {AuthDto} from './dto/auth.dto'
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(authDto: AuthDto) {
    try {
      const { email, password, role } = authDto;
      //check email exist or not
      const existingUser = await this.userService.findOneEmail(email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
      // create new user
      const user = await this.userService.createUser({ email, password, role });
      return { status: 201, message: 'User registered successfully', data: { user } };
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        throw new InternalServerErrorException('Something went wrong during registration');
      }
      throw error;  
    }
  }

  async login(authDto: AuthDto) {
    try {
      const { email, password } = authDto;
      //check email
      const user = await this.userService.findOneEmail(email);
      //check exist email have password or not
      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
      }
      //match stored password with user password
      const isPasswordValid = await bcrypt.compare(String(password), String(user.password));
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect credentials');
      }
      const payload = { userId: user.id, role: user.role };
      //create token using jwt
      const accessToken = this.jwtService.sign(payload);
      return { status: 200, message: 'User login successful', data: { accessToken,userId: user.id, role: user.role } };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong during login');
    }
  }

  async logout(user: any) {
    return { message: 'Logout successful' };
  }
}