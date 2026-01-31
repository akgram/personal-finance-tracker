import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  // N category -> 1 user
  @ManyToOne(() => User, (user) => user.categories)
  user: User;

  // 1 category -> N transaction
  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  // 1 category -> N budget
  @OneToMany(() => Budget, (budget) => budget.category)
  budgets: Budget[];
}