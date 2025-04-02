import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../users/entities/user-role.enum'; 
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  beforeEach(async () => {
    mockUsersService = {
      findOneEmail: jest.fn(),
      createUser: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockAuthDto: AuthDto = { email: 'vaibhavbhana123@gmail.com', password: '123456', role: UserRole.ADMIN };
      const mockUser = {
        id: 1150,
        email: 'vaibhavbhana123@gmail.com',
        password: '$2b$10$Z0Q1Bde4ko8AWToG5dck3.r4kx76ofC6DNxlyijk7amDbKB87GGMq',
        role: { id: 1, name: 'admin' },
        isActive: true,
        createdAt: '2025-04-01T06:39:04.219Z',
        updatedAt: '2025-04-01T06:39:04.219Z',
      };

      mockUsersService.findOneEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await authService.register(mockAuthDto);
      expect(result).toEqual({
        status: 201,
        message: 'User registered successfully',
        data: { user: mockUser },
      });
    });
    it('should throw BadRequestException if email already exists', async () => {
      const mockAuthDto: AuthDto = { email: 'vaibhavbhana123@gmail.com', password: '123456', role: UserRole.ADMIN };
      mockUsersService.findOneEmail.mockResolvedValue({ email: 'vaibhavbhana123@gmail.com' });
      await expect(authService.register(mockAuthDto)).rejects.toThrowError(BadRequestException);
    });
  });

});
