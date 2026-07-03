import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  getIndex() {
    return {
      index: {
        title: 'Express API Template',
        environment: this.configService.get<string>('NODE_ENV') || 'development',
      },
    };
  }
}
