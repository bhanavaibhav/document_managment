import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './entities/document.entity'; // Adjust the import path if needed
import { of } from 'rxjs';

describe('DocumentsService', () => {
  let documentsService: DocumentsService;

  // Mock HttpService
  const mockHttpService = {
    get: jest.fn().mockReturnValue(of({ data: {} })),
    post: jest.fn().mockReturnValue(of({ data: {} })),
    put: jest.fn().mockReturnValue(of({ data: {} })),
    delete: jest.fn().mockReturnValue(of({ data: {} })),
  };

  // Mock DocumentRepository
  const mockDocumentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
      ],
    }).compile();

    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(documentsService).toBeDefined();
  });
});
