import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Request } from 'express';
import { MessageVerifier } from '../utils/message-verifier';
import { TokenAccessDeniedException } from '../exceptions/token-access-denied.exception';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { currentUser?: object }>();
    const tokenRegex = /^Bearer /;
    const separatorRegex = /\s*(?::|;|\t+)\s*/;
    const auth = request.headers.authorization;

    try {
      if (auth && tokenRegex.test(auth)) {
        const opts = auth.replace(tokenRegex, '').split(separatorRegex);
        const signedToken = opts.shift();
        if (signedToken) {
          const token = MessageVerifier.verify(signedToken);
          if (token) {
            const user = await this.userModel.findOne({ token }).exec();
            if (user) {
              request.currentUser = user.toObject();
              return true;
            }
          }
        }
      }
    } catch {
      // invalid token material falls through to access denied
    }

    throw new TokenAccessDeniedException();
  }
}
