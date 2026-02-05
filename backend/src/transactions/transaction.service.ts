import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
    constructor(@InjectRepository(Transaction) private repo: Repository<Transaction>,) {}

    async create(createDto: any, userId: number) {
        const transaction = this.repo.create({
            amount: createDto.amount,
            description: createDto.description,
            type: createDto.type,
            createdAt: createDto.createdAt || new Date(),
            user: { id: userId },
            category: createDto.categoryId ? { id: createDto.categoryId } : undefined
        });

        return await this.repo.save(transaction);
    }

    async update(id: number, updateDto: any, userId: number) {
        const transaction = await this.repo.findOne({
            where: {id, user: {id: userId} }
        });

        console.log("test");
        console.log(transaction);

        if(!transaction) {
            throw new NotFoundException("Transaction not found");
        }

        transaction.amount = updateDto.amount ?? transaction.amount;
        transaction.description = updateDto.description ?? transaction.description;
        transaction.type = updateDto.type ?? transaction.type;
        transaction.createdAt = updateDto.createdAt ?? transaction.createdAt;

        if(updateDto.categoryId !== undefined) {
            transaction.category = updateDto.categoryId ? ({ id: updateDto.categoryId } as any) : undefined;
        }

        return await this.repo.save(transaction);
    }


    async findAllByUser(userId: number) {
        return await this.repo.find({
        where: { user: { id: userId } },
        relations: ['category'],
        order: { createdAt: 'DESC' },
        });
    }

    async getStats(userId: number) {
        const transactions = await this.repo.find({
        where: { user: { id: userId } },
        });

        return transactions.reduce(
        (acc, t) => {
            const amount = Number(t.amount);
            if (t.type === 'income') {
            acc.income += amount;
            acc.totalBalance += amount;
            } else {
            acc.expense += amount;
            acc.totalBalance -= amount;
            }
            return acc;
        },
        { totalBalance: 0, income: 0, expense: 0 },
        );
    }

    async remove(id: number, userId: number) {
        const transaction = await this.repo.findOne({
        where: { id, user: { id: userId } }, });

        if (!transaction) {
            throw new NotFoundException();
        }

        return await this.repo.remove(transaction);
    }

    async assignToCategory(transactionIds: number[], categoryId: number, userId: number) {
    return await this.repo.update(
        { id: In(transactionIds), user: { id: userId } },
        { category: { id: categoryId } }
    );
}
}