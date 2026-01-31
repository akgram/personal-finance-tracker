import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hash-ovana lozinka (za Passport.js)

  @Column({ default: true })
  isActive: boolean;


  // 1 user -> N category
  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  // 1 user -> N transaction
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  // 1 user -> N budget
  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];
}