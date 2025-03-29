import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);
  await seeder.onModuleInit();
  await app.close();
  console.log('✅ Seeding complete!');
}

bootstrap().catch((err) => console.error('❌ Seeding failed:', err));
