import {
  Controller,
  Post,
  UseGuards,
  Get,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { User } from './user.entity';
import { AuthGuardLocal } from './auth-guard.local';
import { AuthGuardJwt } from './auth-guard.jwt';

@Controller('auth')
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(AuthGuardLocal) // auth guard will call validate() method in LocalStrategy
  async login(@CurrentUser() user: User) {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }
  @Get('profile')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuardJwt) // auth guard will call validate() method in JwtStrategy
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
