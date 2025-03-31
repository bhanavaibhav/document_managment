import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [AuthModule, UsersModule,DatabaseModule, DocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
