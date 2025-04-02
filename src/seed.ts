import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed/seed.module';
import { SeederService } from './seed/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seeder = app.get(SeederService);

  console.log('Running Seeder...');
  await seeder.onModuleInit();

  console.log('Seeding Completed!');
  await app.close();
}

bootstrap();