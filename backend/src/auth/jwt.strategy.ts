import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secretKey = configService.get<string>('JWT_SECRET');

    if (!secretKey) {
      throw new Error('JWT_SECRET nije pronađen u .env fajlu!');
    }

    super({
      // uzimamo token iz header-a
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  // passport za proveru digitalnog potpisa tokena
  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token nije validan');
    }
    
    return { 
      id: payload.sub, 
      email: payload.email 
    };
  }
}