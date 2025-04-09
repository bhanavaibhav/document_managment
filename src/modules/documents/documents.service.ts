import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { User } from '../users/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserRole } from '../users/entities/user-role.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private httpService: HttpService,
  ) {}

  //  Upload Document
  async createDocument(createDocumentDto: CreateDocumentDto, fileUrl: string, user: User): Promise<Document> {
    const document = this.documentRepository.create({ ...createDocumentDto, fileUrl, uploadedBy: user,status: 'pending', });
    return this.documentRepository.save(document);
  }

  //  Get All Documents
  async getAllDocuments(user: User, page: number, limit: number) {
    const skip = (page - 1) * limit;
    let query = this.documentRepository.createQueryBuilder('document');
    // If user is not an admin, filter documents by user_id
    if (user.role.name !== UserRole.ADMIN) {
      query = query.where('document.uploadedBy.id = :userId', { userId: user.id });
    }

    const [data, total] = await query
      .orderBy('document.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  //  Get Document by ID
  async getDocumentById(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  //  Update Document
  async updateDocument(id: number, updateDocumentDto: UpdateDocumentDto, user: User): Promise<Document> {
    const document = await this.getDocumentById(id);

    // Restrict update if the user is not the owner and not an Admin
    if (user.role.name !== 'admin' && document.uploadedBy.id !== user.id) {
      throw new ForbiddenException('You do not have permission to update this document');
    }

    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  //  Delete Document
  async deleteDocument(id: number): Promise<void> {
    const document = await this.getDocumentById(id);
    await this.documentRepository.remove(document);
  }
 // update document status
  async updateDocumentStatus(id: number, status: string) {
    return this.documentRepository.update(id, { status });
  }

  async triggerIngestion(id: number, path: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/ingest', { document_path: path })
      );

      if (response.data.status === 'processed') {
        await this.updateDocumentStatus(id, 'processed');
      }
    } catch (error) {
      console.error('Ingestion failed', error);
      throw new NotFoundException(`Ingestion failed`);
    }
  }
}
