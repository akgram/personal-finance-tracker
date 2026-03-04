import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.contoller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    UsersModule,
    ConfigModule,

    // za mail
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST') || 'smtp.mailtrap.io',
          port: configService.get<number>('MAIL_PORT') || 2525,
          auth: {
            user: configService.get<string>('MAIL_USER'), // iz .env
            pass: configService.get<string>('MAIL_PASS'), // iz .env
          },
        },
        defaults: {
          from: '"Personal Finance Tracker" <noreply@personalFT.com>',
        },
      }),
    }),


    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // iz .env
        signOptions: { expiresIn: '1h' },
        global: true
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}