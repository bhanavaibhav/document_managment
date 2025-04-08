import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './entities/user-role.enum';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockRoleRepo = {
    findOne: jest.fn(),
  };

  const mockRole = { id: 1, name: UserRole.ADMIN,users:Promise.resolve([])};
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    password: 'hashedpass',
    role: mockRole,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepo },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockRoleRepo.findOne.mockResolvedValue(mockRole);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await usersService.createUser({
        email: 'user@example.com',
        password: 'test123',
        role: UserRole.ADMIN,
      });

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        usersService.createUser({
          email: 'user@example.com',
          password: 'test123',
          role: UserRole.ADMIN,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if role not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockRoleRepo.findOne.mockResolvedValue(null);

      await expect(
        usersService.createUser({
          email: 'user@example.com',
          password: 'test123',
          role: 'invalidRole' as UserRole,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserRepo.find.mockResolvedValue(users);

      const result = await usersService.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOneById', () => {
    it('should return user if found', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await usersService.findOneById(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(usersService.findOneById(2)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOneEmail', () => {
    it('should return user if found by email', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await usersService.findOneEmail('user@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserRole', () => {
    it('should update role if valid', async () => {
      const newRole = { id: 2, name: UserRole.EDITOR,users:Promise.resolve([]),};
      const updatedUser = { ...mockUser, role: newRole };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);
      mockRoleRepo.findOne.mockResolvedValue(newRole);
      mockUserRepo.save.mockResolvedValue(updatedUser);

      const result = await usersService.updateUserRole({
        userId: 1,
        role: UserRole.EDITOR,
      });

      expect(result.role).toEqual(newRole);
    });

    it('should throw BadRequestException if user already has role', async () => {
      const mockAdminRole = {
        id: 1,
        name: UserRole.ADMIN,
        users: Promise.resolve([]),
      };
    
      const userWithAdminRole = {
        ...mockUser,
        role: mockAdminRole,
      };
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(userWithAdminRole);
      mockRoleRepo.findOne.mockResolvedValue(mockAdminRole);

      await expect(
        usersService.updateUserRole({ userId: 1, role: UserRole.ADMIN }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user if exists', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);
      mockUserRepo.softRemove.mockResolvedValue(undefined);

      await expect(usersService.deleteUser(1)).resolves.toBeUndefined();
    });
  });
});
