import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './users/user.entity';
import { Category } from './categories/category.entity';
import { Transaction } from './transactions/transaction.entity';
import { Budget } from './budgets/budgets.entity';

import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'finance_user',
      password: 'finance_pass',
      database: 'finance_db',
      entities: [User, Category, Transaction, Budget], // moze auto?
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}