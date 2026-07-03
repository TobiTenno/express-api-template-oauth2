import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateExampleDto } from '../dto/create-example.dto';
import { UpdateExampleDto } from '../dto/update-example.dto';
import { ExamplesService } from '../services/examples.service';

@ApiTags('examples')
@Controller('examples')
export class ExamplesController {
  constructor(@Inject(ExamplesService) private readonly examplesService: ExamplesService) {}

  @Get()
  findAll() {
    return this.examplesService.findAll();
  }

  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  create(@Body() body: CreateExampleDto, @CurrentUser() currentUser: { _id: unknown }) {
    return this.examplesService.create(body ?? {}, currentUser._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examplesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateExampleDto,
    @CurrentUser() currentUser: { _id: unknown },
    @Res() res: Response,
  ): Promise<void> {
    await this.examplesService.update(id, currentUser._id, body ?? {});
    res.status(200).end();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: { _id: unknown },
    @Res() res: Response,
  ): Promise<void> {
    await this.examplesService.remove(id, currentUser._id);
    res.status(200).end();
  }
}
