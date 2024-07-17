import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

// in nestjs, every strategy must extend a strategy class
// in this case, we are using the PassportStrategy class
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);
  // the constructor of the class must call the super() method
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  // the validate() method is a required method that must be implemented
  // this method is called when a user tries to log in
  // the method should return the user if the user is found
  // or null if the user is not found
  public async validate(username: string, password: string): Promise<any> {
    console.log(username);
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      this.logger.debug(`User not found: ${username}`);
      throw new UnauthorizedException();
    }
    if (!(await bcrypt.compare(password, user.password))) {
      this.logger.debug(`Invalid password for user: ${username}`);
      throw new UnauthorizedException();
    }
    return user;
  }
}
