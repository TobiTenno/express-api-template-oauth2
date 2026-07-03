import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExampleDto } from '../dto/create-example.dto';
import { UpdateExampleDto } from '../dto/update-example.dto';
import { Example, ExampleDocument } from '../schemas/example.schema';

@Injectable()
export class ExamplesService {
  constructor(@InjectModel(Example.name) private readonly exampleModel: Model<ExampleDocument>) {}

  async findAll(): Promise<ExampleDocument[]> {
    return this.exampleModel.find().exec();
  }

  async findById(id: string): Promise<ExampleDocument> {
    const example = await this.exampleModel.findById(id).exec();
    if (!example) {
      throw new NotFoundException('No example found');
    }
    return example;
  }

  async create(body: CreateExampleDto, ownerId: unknown): Promise<ExampleDocument> {
    return this.exampleModel.create({
      ...body,
      _owner: ownerId,
    });
  }

  async update(id: string, ownerId: unknown, body: UpdateExampleDto): Promise<void> {
    const search = { _id: id, _owner: ownerId };
    const example = await this.exampleModel.findOne(search).exec();
    if (!example) {
      throw new NotFoundException('No example found');
    }

    const update = { ...body };
    delete update._owner;
    await example.updateOne({ $set: update });
  }

  async remove(id: string, ownerId: unknown): Promise<void> {
    const search = { _id: id, _owner: ownerId };
    const example = await this.exampleModel.findOne(search).exec();
    if (!example) {
      throw new NotFoundException('No example found');
    }

    await this.exampleModel.deleteOne(search).exec();
  }
}
