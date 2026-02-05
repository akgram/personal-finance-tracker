import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
    constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,) {}

    async findAll(userId: number): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { user: { id: userId } },
        });
    }

    async create(name: string, icon: string, userId: number): Promise<Category> {
        const category = this.categoryRepository.create({
            name,
            icon,
            user: { id: userId },
        });
        return this.categoryRepository.save(category);
    }

    async update(id: number, userId: number, updateData: { name?: string, icon?: string }): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id, user: { id: userId } },
        });

        if (!category) {
            throw new NotFoundException(`Category not found`);
        }

        Object.assign(category, updateData);
        return this.categoryRepository.save(category);
    }

    async remove(id: number, userId: number): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id, user: { id: userId } },
        });

        if (!category) {
            throw new NotFoundException(`Category not found`);
        }

        await this.categoryRepository.remove(category);
    }
}