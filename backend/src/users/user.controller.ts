import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('register')
  register(@Body() userData: any) {
    return this.usersService.create(userData);
  }
}