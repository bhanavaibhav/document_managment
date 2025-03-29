import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['C:/Users/hp/Documents/Nest/src/modules/**/entities/*.entity.{ts,js}'], // Locate all entity files
  migrations: ['C:/Users/hp/Documents/Nest/src/database/migrations/*{.ts,.js}'], // Locate migration files
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});
