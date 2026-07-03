import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from '../services/app.service';

@ApiTags('Default')
@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get()
  root() {
    return this.appService.getIndex();
  }
}
