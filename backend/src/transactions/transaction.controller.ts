import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/auth.guard'; 

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Post()
    create(@Body() createDto: any, @Req() req: any) {
    return this.transactionsService.create(createDto, req.user.id);
    }

    @Get()
    findAll(@Req() req: any) {
    return this.transactionsService.findAllByUser(req.user.id);
    }

    @Get('stats')
    getStats(@Req() req: any) {
    return this.transactionsService.getStats(req.user.id);
    }
    
    @Patch('assign-category')
    assignToCategory(@Body() body: { transactionIds: number[]; categoryId: number }, @Req() req) {
        return this.transactionsService.assignToCategory(
            body.transactionIds, 
            body.categoryId, 
            req.user.id
        );
    }
    
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.transactionsService.update(+id, updateDto, req.user.id); // +id string->number
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
    return this.transactionsService.remove(+id, req.user.id);
    }

}