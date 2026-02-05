import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';

@Injectable()
export class BudgetsService {
    constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,) {}

    async findAll(userId: number): Promise<Budget[]> {
        return this.budgetRepository.find({
            where: { user: { id: userId } },
            relations: ['category'],
        });
    }

    async create(data: any, userId: number): Promise<Budget> {
        const budget = this.budgetRepository.create({
            amount: data.amount,
            month: data.month,
            year: data.year,
            user: { id: userId },
            category: { id: data.categoryId }
        });
        return this.budgetRepository.save(budget);
    }

    async update(id: number, data: any, userId: number): Promise<Budget> {
        const budget = await this.budgetRepository.findOne({
            where: { id, user: { id: userId } }
        });
        if (!budget) 
            throw new NotFoundException();

        Object.assign(budget, {
            amount: data.amount,
            month: data.month,
            year: data.year,
            category: { id: data.categoryId }
        });

        return this.budgetRepository.save(budget);
    }

    async remove(id: number, userId: number): Promise<void> {
        const result = await this.budgetRepository.delete({ id, user: { id: userId } });
        if (result.affected === 0) 
            throw new NotFoundException();
    }
}