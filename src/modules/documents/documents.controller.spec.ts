import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Adjust import path as needed
import { JwtModule } from '@nestjs/jwt';

describe('DocumentsController', () => {
  let documentsController: DocumentsController;

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  // Mock UsersService
  const mockUsersService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  // Mock DocumentsService
  const mockDocumentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secret' })],
      controllers: [DocumentsController],
      providers: [
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: DocumentsService, useValue: mockDocumentsService },
        JwtAuthGuard,
      ],
    }).compile();

    documentsController = module.get<DocumentsController>(DocumentsController);
  });

  it('should be defined', () => {
    expect(documentsController).toBeDefined();
  });
});
