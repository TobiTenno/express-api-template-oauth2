import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import { Model } from 'mongoose';
import { MessageVerifier } from '../common/utils/message-verifier';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User, UserDocument } from '../schemas/user.schema';

const userFilter = { passwordDigest: 0, token: 0 };

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  private async getToken(): Promise<string> {
    return randomBytes(16).toString('base64');
  }

  private encodeToken(token: string): string {
    return MessageVerifier.generate(token);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({}, userFilter).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id, userFilter).exec();
    if (!user) {
      throw new NotFoundException('No such user');
    }
    return user;
  }

  async signup(body: CreateUserDto): Promise<Record<string, unknown>> {
    const credentials = body?.credentials ?? body;
    if (!credentials || !credentials.email || !credentials.password) {
      throw new BadRequestException('Bad Request. No `credentials`.');
    }

    const presave = new this.userModel({
      email: credentials.email,
      password: credentials.password,
      token: await this.getToken(),
    });
    const created = await presave.save();
    const user = created.toObject() as unknown as Record<string, unknown>;
    delete user.token;
    delete user.passwordDigest;
    delete user.__v;
    return user;
  }

  async login(authorization?: string): Promise<Record<string, unknown>> {
    let credentials: { email: string; password: string } | undefined;

    if (authorization?.startsWith('Basic')) {
      const encoded = authorization.split(' ')[1];
      if (!encoded) {
        throw Object.assign(new Error('Invalid authorization'), { status: 401 });
      }
      const plain = Buffer.from(encoded, 'base64')
        .toString()
        .split(':')
        .filter((s) => s.length);
      if (plain.length !== 2) {
        throw Object.assign(new Error('Invalid authorization'), { status: 401 });
      }
      credentials = { email: plain[0], password: plain[1] };
    } else {
      throw Object.assign(new Error('Invalid authorization'), { status: 401 });
    }

    const userDoc = await this.userModel.findOne({ email: credentials.email }).exec();
    const token = userDoc!.comparePassword(credentials.password);
    userDoc!.token = token;
    const user = userDoc!.toObject() as unknown as Record<string, unknown>;
    delete user.passwordDigest;
    user.token = this.encodeToken(user.token as string);
    delete user.__v;
    return user;
  }

  async logout(currentUser: { _id: unknown; token: string }): Promise<void> {
    const token = await this.getToken();
    await this.userModel
      .findOneAndUpdate({ _id: currentUser._id, token: currentUser.token }, { token })
      .exec();
  }

  async update(
    id: string,
    currentUser: { token: string },
    body: UpdateUserDto,
  ): Promise<Record<string, unknown>> {
    const user = await this.userModel.findOne({ _id: id, token: currentUser.token }).exec();
    if (!user) {
      throw new NotFoundException('No such user');
    }

    const hasEdit = !!(body?.password || body?.email);
    if (!hasEdit) {
      throw new BadRequestException('No modified field.');
    }

    const query: { $set: Record<string, unknown> } = { $set: {} };
    Object.keys(body)
      .filter((key) => !['_id', 'password'].includes(key))
      .forEach((key) => {
        query.$set[key] = body[key];
      });

    const updatedUser = await this.userModel.findOneAndUpdate({ _id: id }, query).exec();
    if (!updatedUser) {
      throw new NotFoundException('No such user');
    }

    if (body.password) {
      updatedUser.password = body.password;
      await updatedUser.save();
    }

    return updatedUser.toObject() as unknown as Record<string, unknown>;
  }
}
