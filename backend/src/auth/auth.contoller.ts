import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Query, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';

@Controller('auth')
//@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() userDto: any) {
    return this.authService.register(userDto);
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is missing!');
    }
    return this.authService.verifyEmail(token);
  }
}