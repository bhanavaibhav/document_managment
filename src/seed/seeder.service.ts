import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../modules/users/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import {Document} from '../modules/documents/entities/document.entity'
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Document) private documentRepo: Repository<Document>,
  ) { }

  async onModuleInit() {
    await this.seedRoles();
    await this.seedUsersAndDocuments();
  }

  async seedRoles() {
    const roles = ['admin', 'editor', 'viewer'];
    for (const name of roles) {
      const roleExists = await this.roleRepo.findOne({ where: { name } });
      if (!roleExists) {
        await this.roleRepo.save({ name });
      }
    }
  }

  async seedUsersAndDocuments() {
    const roles = await this.roleRepo.find();
    if (!roles.length) {
      console.error('No roles found, run role seeder first.');
      return;
    }

    const hashedPassword = await bcrypt.hash('1234', 10);

    for (let i = 0; i < 100; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const user = await this.userRepo.save({
        email: faker.internet.email(),
        password: hashedPassword,
        role,
      });

      // Generate 100 documents per user with the same fileUrl
      const documents:Document[] = [];
      for (let j = 0; j < 10; j++) {
        documents.push({
          title: faker.lorem.words(3),
          content:faker.lorem.paragraphs(2),
          fileUrl: "/uploads/sample.pdf",
          status: 'processed',
          uploadedBy: user,
          createdAt: new Date(),
        });
      }
      await this.documentRepo.save(documents);
    }


    console.log('Users and Documents Seeded!');
  }
}