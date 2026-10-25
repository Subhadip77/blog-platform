import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI_TEST;
const dbName = uri ? new URL(uri).pathname.replace('/', '') : '';

beforeAll(async () => {
  if (!uri || !dbName.endsWith('-test')) {
    throw new Error('MONGO_URI_TEST must point to a database whose name ends with "-test"');
  }
  await mongoose.connect(uri);
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
}, 60000);

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});