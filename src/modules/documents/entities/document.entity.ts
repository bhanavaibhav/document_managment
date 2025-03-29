import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  fileUrl: string;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => User, (user) => user.id, { eager: true,onDelete:'CASCADE' })
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}