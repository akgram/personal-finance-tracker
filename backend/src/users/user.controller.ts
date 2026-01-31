import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('register')
  register(@Body('email') email: string, @Body('pass') pass: string) {
    return this.usersService.create(email, pass);
  }
}