import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('signup')
  @HttpCode(200)
  signup(@Body() body: CreateUserDto) {
    return this.usersService.signup(body ?? {});
  }

  @Post('login')
  @HttpCode(200)
  login(@Headers('authorization') authorization?: string) {
    return this.usersService.login(authorization);
  }

  @Delete('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async logout(
    @CurrentUser() currentUser: { _id: unknown; token: string },
    @Res() res: Response,
  ): Promise<void> {
    await this.usersService.logout(currentUser);
    res.status(200).end();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @CurrentUser() currentUser: { token: string },
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, currentUser, body ?? {});
  }
}
