import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { HttpService } from '@nestjs/axios';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.enum';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { of } from 'rxjs';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let mockDocumentRepo: any;
  let mockHttpService: any;

  const mockUser = { id: 1, role: { name: UserRole.ADMIN } } as User;
  const mockDocument = { id: 1, uploadedBy: mockUser };

  beforeEach(async () => {
    mockDocumentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDocument], 1]),
      }),
    };

    mockHttpService = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepo,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDocument', () => {
    it('should create and save a new document', async () => {
      const dto = { title: 'Test Doc',content:"content" };
      const fileUrl = 'http://example.com/file.pdf';
      const docEntity = { ...dto, fileUrl, uploadedBy: mockUser, status: 'pending' };

      mockDocumentRepo.create.mockReturnValue(docEntity);
      mockDocumentRepo.save.mockResolvedValue(docEntity);

      const result = await service.createDocument(dto as any, fileUrl, mockUser);
      expect(result).toEqual(docEntity);
      expect(mockDocumentRepo.create).toHaveBeenCalledWith(expect.objectContaining({ fileUrl }));
    });
  });

  describe('getAllDocuments', () => {
    it('should return paginated documents for admin', async () => {
      const result = await service.getAllDocuments(mockUser, 1, 10);
      expect(result.data).toEqual([mockDocument]);
      expect(result.total).toBe(1);
    });
  });

  describe('getDocumentById', () => {
    it('should return a document if found', async () => {
      mockDocumentRepo.findOne.mockResolvedValue(mockDocument);
      const result = await service.getDocumentById(1);
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException if not found', async () => {
      mockDocumentRepo.findOne.mockResolvedValue(null);
      await expect(service.getDocumentById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDocument', () => {
    it('should update document if owner or admin', async () => {
      mockDocumentRepo.findOne.mockResolvedValue(mockDocument);
      mockDocumentRepo.save.mockResolvedValue({ ...mockDocument, title: 'Updated' });

      const result = await service.updateDocument(1, { title: 'Updated' } as any, mockUser);
      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException if not owner and not admin', async () => {
      const anotherUser = { id: 2, role: { name: UserRole.VIEWER } } as User;
      mockDocumentRepo.findOne.mockResolvedValue(mockDocument);

      await expect(service.updateDocument(1, {} as any, anotherUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteDocument', () => {
    it('should remove document if found', async () => {
      mockDocumentRepo.findOne.mockResolvedValue(mockDocument);
      mockDocumentRepo.remove.mockResolvedValue(mockDocument);
      await expect(service.deleteDocument(1)).resolves.toBeUndefined();
    });
  });

  describe('updateDocumentStatus', () => {
    it('should update document status', async () => {
      mockDocumentRepo.update.mockResolvedValue({ affected: 1 });
      await expect(service.updateDocumentStatus(1, 'processed')).resolves.toBeTruthy();
    });
  });

  describe('triggerIngestion', () => {
    it('should call ingestion API and update status if processed', async () => {
      mockHttpService.post.mockReturnValue(of({ data: { status: 'processed' } }));
      mockDocumentRepo.update.mockResolvedValue({});

      await service.triggerIngestion(1, '/path/to/doc');
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://localhost:8000/ingest',
        { document_path: '/path/to/doc' }
      );
    });

    it('should throw NotFoundException when ingestion fails', async () => {
      mockHttpService.post.mockImplementation(() => {
        throw new Error('Fail');
      });
    
      await expect(service.triggerIngestion(1, '/fail/path')).rejects.toThrow(NotFoundException);
    });
  });
});
