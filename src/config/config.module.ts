import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import * as path from 'path';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, 
    envFilePath: path.resolve(process.cwd(), '.env'),
    ignoreEnvFile: false,
  }),],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigAppModule {}
