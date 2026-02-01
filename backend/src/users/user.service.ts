import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: any): Promise<User> {
    const { email, password } = userData;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      email: email,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(newUser);
  }

  async findOne(email: string): Promise<User | any> {
    return this.usersRepository.findOne({ where: { email } });
  }
}