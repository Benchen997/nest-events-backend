import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppFrancaisService {
  constructor(
    @Inject('APP_NAME')
    private readonly name: string,
    @Inject('MESSAGE')
    private readonly message: string,
  ) {}
  getHello(): string {
    return `Bonjour le monde! from ${this.name}, ${this.message} `;
  }
}
