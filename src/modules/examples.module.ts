import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamplesController } from '../controllers/examples.controller';
import { Example, ExampleSchema } from '../schemas/example.schema';
import { ExamplesService } from '../services/examples.service';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Example.name, schema: ExampleSchema }]),
    UsersModule,
  ],
  controllers: [ExamplesController],
  providers: [ExamplesService],
})
export class ExamplesModule {}
