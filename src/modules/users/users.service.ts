import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // ****************** Create a New User with Hashed Password ******************
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, password, role } = createUserDto;

      // Check if the user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        this.logger.warn(`User registration failed - Email already exists: ${email}`);
        throw new ConflictException('Email is already registered');
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Find role (default to 'viewer' if not provided)
      const userRole = await this.roleRepository.findOne({ where: { name: role || 'viewer' } });
      if (!userRole) {
        this.logger.error(`Role not found: ${role}`);
        throw new BadRequestException('Invalid role');
      }

      const newUser = this.userRepository.create({ email, password: hashedPassword, role: userRole });
      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // ****************** Find All Users ******************
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['role'] });
  }

  // ****************** Find a User by ID ******************
  async findOneById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id }, relations: ['role'] });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  // ****************** Find a User by Email ******************
  async findOneEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['role'] });
  }

  // ****************** Update User Role ******************
  async updateUserRole(updateUserRoleDto: UpdateUserRoleDto): Promise<User> {
    try {
      const { userId, role } = updateUserRoleDto;

      // Fetch user
      const user = await this.findOneById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Fetch role
      const newRole = await this.roleRepository.findOne({ where: { name: role } });
      if (!newRole) {
        throw new BadRequestException('Invalid role');
      }

      // Prevent role escalation if user already has the role
      if (user.role.id === newRole.id) {
        this.logger.warn(`User already has role - UserID: ${user.id}, Role: ${role}`);
        throw new BadRequestException('User already has this role');
      }

      // Update role
      user.role = newRole;
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`User role updated - UserID: ${user.id}, New Role: ${role}`);

      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user role: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  // ****************** Soft Delete a User ******************
  async deleteUser(id: number): Promise<void> {
    try {
      const user = await this.findOneById(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.userRepository.softRemove(user);
      this.logger.log(`User deleted successfully - Email: ${user.email}`);
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
