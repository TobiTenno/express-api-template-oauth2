import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { HydratedDocument } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export type UserDocument = HydratedDocument<User> & {
  password?: string;
  _password?: string;
  comparePassword(password: string): string;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, unique: true, required: true })
  email!: string;

  @Prop({ type: String, required: true })
  token!: string;

  @Prop({ type: String })
  passwordDigest?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(uniqueValidator);

UserSchema.virtual('password').set(function (this: UserDocument, password: string) {
  this._password = password;
});

UserSchema.methods.comparePassword = function (this: UserDocument, password: string): string {
  const compared = compareSync(password, this.passwordDigest ?? '');
  if (compared) {
    return this.token;
  }
  const err = new Error('Not Authorized') as Error & { status: number };
  err.status = 401;
  throw err;
};

UserSchema.pre('save', function (next) {
  const doc = this as UserDocument;
  if (doc._password) {
    const salt = genSaltSync();
    if (!salt) {
      throw new Error('no salt');
    }
    const digest = hashSync(doc._password, salt);
    if (!digest) {
      throw new Error('no digest');
    }
    doc.passwordDigest = digest;
  }
  next();
});
