import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ default: 'expense' }) // 'income' ili 'expense'
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  // N transaction -> 1 user
  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  // N transaction -> 1 category
  @ManyToOne(() => Category, (category) => category.transactions, { onDelete: 'SET NULL' }) // ako obrisem kategoriju, povezani entiteti ostaju u bazi
  category: Category;
}