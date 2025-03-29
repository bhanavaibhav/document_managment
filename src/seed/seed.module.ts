import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Role } from '../modules/users/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { Document } from '../modules/documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, Document]), 
  ],
  providers: [SeederService],
})
export class SeedModule {}
