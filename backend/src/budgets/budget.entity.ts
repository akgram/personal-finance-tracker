import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  month: number;

  @Column()
  year: number;

  // N budget -> 1 user
  @ManyToOne(() => User, (user) => user.budgets)
  user: User;

  // N budget -> 1 category
  @ManyToOne(() => Category, (category) => category.budgets)
  category: Category;
}