import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findOne(email);

    
    
    // provera ali sa bcrypt
    if (user && await bcrypt.compare(password, user.password)) {

      if (!user.isVerified) {
        throw new UnauthorizedException('Please verify your email before logging in!');
      }

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

    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);

    const newUser = await this.usersService.create({
      ...userDto,
      verificationToken,
      isVerified: false,
    });

    // saljemo link
    const verificationLink = `http://localhost:3000/auth/verify?token=${verificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: newUser.email,
        subject: 'Welcome! Please verify your email',
        html: `
          <h1>Welcome to PersonalFinanceTracker</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationLink}">Verify My Email</a>
          <p>If you didn't create this account, you can safely ignore this email.</p>
        `,
      });
    }
    catch (error) {
      console.error('MEJL NIJE POSLAT:', error);
    }

    return { message: 'Registration successful! Please check your email to verify your account.' };

    //return this.usersService.create(userDto);
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    
    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token!');
    }

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: null,
    });

    return { message: 'Email verified successfully! You can now log in.' };
  }
}