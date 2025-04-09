import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { UserRole } from '../users/entities/user-role.enum';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocument = { id: 1, title: 'Test Document' };

  const mockDocumentsService = {
    createDocument: jest.fn(),
    triggerIngestion: jest.fn(),
    getAllDocuments: jest.fn(),
    getDocumentById: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
  };

  const mockUser = { id: 1, role: UserRole.ADMIN };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [{ provide: DocumentsService, useValue: mockDocumentsService }],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDocument', () => {
    it('should throw BadRequestException if no file is provided', async () => {
      await expect(
        controller.createDocument(null as unknown as Express.Multer.File, {} as CreateDocumentDto, { user: mockUser }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a document and trigger ingestion', async () => {
      const mockFile = { filename: 'doc.pdf' } as Express.Multer.File;
      const dto: CreateDocumentDto = { title: 'Test' } as CreateDocumentDto;

      mockDocumentsService.createDocument.mockResolvedValue({ ...mockDocument, id: 1 });

      const result = await controller.createDocument(mockFile, dto, { user: mockUser });

      expect(mockDocumentsService.createDocument).toHaveBeenCalled();
      expect(mockDocumentsService.triggerIngestion).toHaveBeenCalled();
      expect(result).toEqual({ ...mockDocument, id: 1 });
    });
  });

  describe('getAllDocuments', () => {
    it('should return paginated documents', async () => {
      mockDocumentsService.getAllDocuments.mockResolvedValue([mockDocument]);

      const result = await controller.getAllDocuments('1', '10', { user: mockUser });
      expect(result).toEqual([mockDocument]);
      expect(mockDocumentsService.getAllDocuments).toHaveBeenCalledWith(mockUser, 1, 10);
    });
  });

  describe('getDocumentById', () => {
    it('should return a document by ID', async () => {
      mockDocumentsService.getDocumentById.mockResolvedValue(mockDocument);

      const result = await controller.getDocumentById(1);
      expect(result).toEqual(mockDocument);
      expect(mockDocumentsService.getDocumentById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateDocument', () => {
    it('should update a document', async () => {
      const updateDto: UpdateDocumentDto = { title: 'Updated Title' } as UpdateDocumentDto;

      mockDocumentsService.updateDocument.mockResolvedValue({ ...mockDocument, ...updateDto });

      const result = await controller.updateDocument(1, updateDto, { user: mockUser });
      expect(result).toEqual({ ...mockDocument, ...updateDto });
      expect(mockDocumentsService.updateDocument).toHaveBeenCalledWith(1, updateDto, mockUser);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      mockDocumentsService.deleteDocument.mockResolvedValue({ deleted: true });

      const result = await controller.deleteDocument(1);
      expect(result).toEqual({ deleted: true });
      expect(mockDocumentsService.deleteDocument).toHaveBeenCalledWith(1);
    });
  });
});
