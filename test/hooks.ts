import 'reflect-metadata';
import { clearDatabase, closeTestApp, createTestApp } from './setup';

export const mochaHooks = {
  async beforeAll(this: Mocha.Context) {
    this.timeout(60_000);
    await createTestApp();
  },
  async afterEach() {
    await clearDatabase();
  },
  async afterAll() {
    await closeTestApp();
  },
};
