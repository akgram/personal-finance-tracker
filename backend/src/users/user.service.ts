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
    const { password, ...rest } = userData;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
    } as User);
    
    return this.usersRepository.save(newUser);
  }

  async findOne(email: string): Promise<User | any> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { verificationToken: token } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) 
      throw new Error('User not found');

    Object.assign(user, attrs);
    return this.usersRepository.save(user);
  }
}