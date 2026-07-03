import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Model } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app.module';
import { Example, type ExampleDocument } from '../src/schemas/example.schema';
import { User, type UserDocument } from '../src/schemas/user.schema';

process.env.CI = 'true';
process.env.NODE_ENV = 'development';
process.env.SECRET_KEY = 'obCltwRpN3Yn29i7Z8Y1sZwZlIR5MDm9';
process.env.INITIALIZATION_VECTOR = '254vi2tCl86fLtUL';
process.env.LOG_LEVEL = 'error';

export const credentials = { email: 'test@contso.org', password: 'password' };

let mongod: MongoMemoryServer;
let app: INestApplication<App>;
let userModel: Model<UserDocument>;
let exampleModel: Model<ExampleDocument>;

export async function createTestApp(): Promise<INestApplication<App>> {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  userModel = moduleFixture.get<Model<UserDocument>>(getModelToken(User.name));
  exampleModel = moduleFixture.get<Model<ExampleDocument>>(getModelToken(Example.name));

  return app;
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
  }
  if (mongod) {
    await mongod.stop();
  }
}

export async function clearDatabase(): Promise<void> {
  await userModel.deleteMany({});
  await exampleModel.deleteMany({});
}

export function getApp(): INestApplication<App> {
  return app;
}

export function getUserModel(): Model<UserDocument> {
  return userModel;
}

export function getExampleModel(): Model<ExampleDocument> {
  return exampleModel;
}

export async function signup(
  body: Record<string, unknown> = credentials,
): Promise<request.Response> {
  return request(app.getHttpServer()).post('/users/signup').send(body);
}

export async function login(
  opts: { email?: string; password?: string } = {},
): Promise<Record<string, unknown>> {
  const res = await request(app.getHttpServer())
    .post('/users/login')
    .auth(opts.email || credentials.email, opts.password || credentials.password);
  return res.body as Record<string, unknown>;
}
