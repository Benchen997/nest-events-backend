import { Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(AuthGuard('local')) // auth guard will call validate() method in LocalStrategy
  async login(@CurrentUser() user: User) {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }
  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // auth guard will call validate() method in JwtStrategy
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
