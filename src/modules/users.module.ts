import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from '../common/guards/auth.guard';
import { UsersController } from '../controllers/users.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from '../services/users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, AuthGuard],
  exports: [UsersService, MongooseModule, AuthGuard],
})
export class UsersModule {}
