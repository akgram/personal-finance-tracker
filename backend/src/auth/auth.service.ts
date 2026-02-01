import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findOne(email);

    
    
    // provera ali sa bcrypt
    if (user && await bcrypt.compare(password, user.password)) {
      const payload = { email: user.email, sub: user.id };

      return {
        access_token: this.jwtService.sign(payload), // jwt generise ovde
      };
    }
    throw new UnauthorizedException('Data fail!');
  }

  async register(userDto: any) {
    const existingUser = await this.usersService.findOne(userDto.email);
    if(existingUser) {
      throw new ConflictException('User already exist!');
    }

    return this.usersService.create(userDto);
  }
}