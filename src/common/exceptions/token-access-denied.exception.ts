import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenAccessDeniedException extends HttpException {
  constructor() {
    super('HTTP Token: Access denied.', HttpStatus.UNAUTHORIZED);
  }
}
