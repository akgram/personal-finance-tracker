import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BudgetsService } from './budget.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  findAll(@Req() req) {
    return this.budgetsService.findAll(req.user.id);
  }

  @Post()
  create(@Body() body: any, @Req() req) {
    return this.budgetsService.create(body, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.budgetsService.update(+id, body, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.budgetsService.remove(+id, req.user.id);
  }
}