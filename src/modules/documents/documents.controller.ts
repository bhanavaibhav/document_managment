import { 
    Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ParseIntPipe, UseInterceptors, UploadedFile, 
    BadRequestException,
    Query,
    Req
  } from '@nestjs/common';
  import { DocumentsService } from './documents.service';
  import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { UserRole } from '../../modules/users/entities/user-role.enum';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { multerConfig } from 'src/config/multer.config';
  import * as path from 'path';
  

  
  @Controller('documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class DocumentsController {
    constructor(private readonly documentService: DocumentsService,) {}
  
    //  Upload Document
    @Post()
    @UseInterceptors(FileInterceptor('file',multerConfig))
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    async createDocument(
      @UploadedFile() file: Express.Multer.File,
      @Body() createDocumentDto: CreateDocumentDto,
      @Request() req
    ) {
      if (!file) {
        throw new BadRequestException('File is required');
      }
      const fileUrl = `uploads/${file.filename}`; 
      const document= await this.documentService.createDocument(createDocumentDto, fileUrl, req.user);
      if(!document.id){
        throw new BadRequestException('Document is required');
      }
      const absoluteFilePath = path.resolve(__dirname, '..', 'uploads', file.filename);
      this.documentService.triggerIngestion(document.id, absoluteFilePath);
      return document;


      
    }
  
    //  Get All Documents
    @Get()
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
    async getAllDocuments(
      @Query('page') page = '1', 
      @Query('limit') limit = '10',
      @Request() req
    ) {
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      const user = req.user;
      return this.documentService.getAllDocuments(user, pageNumber, limitNumber);
    }
    //  Get Document by ID
    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
    async getDocumentById(@Param('id', ParseIntPipe) id: number) {
      return this.documentService.getDocumentById(id);
    }
  
    //  Update Document by admin or editior
    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    async updateDocument(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDocumentDto: UpdateDocumentDto,
      @Request() req
    ) {
      return this.documentService.updateDocument(id, updateDocumentDto, req.user);
    }
  
    // Delete Document by admin
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async deleteDocument(@Param('id', ParseIntPipe) id: number) {
      return this.documentService.deleteDocument(id);
    }
  }
  