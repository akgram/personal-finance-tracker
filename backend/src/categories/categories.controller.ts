import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    findAll(@Req() req) {
        return this.categoriesService.findAll(req.user.id);
    }

    @Post()
    create(@Body() body: { name: string; icon: string }, @Req() req) {
        return this.categoriesService.create(body.name, body.icon, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { name?: string; icon?: string }, @Req() req) {
        return this.categoriesService.update(+id, req.user.id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        return this.categoriesService.remove(+id, req.user.id);
    }
}