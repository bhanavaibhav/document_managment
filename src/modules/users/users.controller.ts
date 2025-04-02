import { 
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //  Only Admin Can Create Users
  @Post()
  @Roles(UserRole.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  //  Viewer, Editor & Admin Can View All Users
  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  //  Viewer, Editor & Admin Can View a Specific User
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  //  Only Admin & Editor Can Update User Roles
  @Put('/role')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async updateUserRole(@Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.usersService.updateUserRole(updateUserRoleDto);
  }

  //  Only Admin Can Delete Users
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}