import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../modules/users/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { Document } from '../modules/documents/entities/document.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedUsersAndDocuments();
  }

  async seedRoles() {
    const roleRepo = this.dataSource.getRepository(Role);
    const roles = ['admin', 'editor', 'viewer'];

    for (const name of roles) {
      const roleExists = await roleRepo.findOne({ where: { name } });
      if (!roleExists) {
        await roleRepo.save({ name });
      }
    }
  }

  async seedUsersAndDocuments() {
    const roleRepo = this.dataSource.getRepository(Role);
    const userRepo = this.dataSource.getRepository(User);
    const documentRepo = this.dataSource.getRepository(Document);

    const roles = await roleRepo.find();
    if (!roles.length) {
      console.error('No roles found, run role seeder first.');
      return;
    }

    const hashedPassword = await bcrypt.hash('1234', 10);

    for (let i = 0; i < 1000; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const user = await userRepo.save({
        email: faker.internet.email(),
        password: hashedPassword,
        role,
      });

      const documents: Document[] = [];
      for (let j = 0; j < 100; j++) {
        documents.push({
          title: faker.lorem.words(3),
          content: faker.lorem.paragraphs(2),
          fileUrl: "/files/sample.pdf",
          status: 'pending',
          uploadedBy: user,
          createdAt: new Date(),
        });
      }
      await documentRepo.save(documents);
    }

    console.log('Users and Documents Seeded!');
  }
}
