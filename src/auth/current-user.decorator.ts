import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // this step is same as @Request() decorator
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);
