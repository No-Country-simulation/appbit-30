import { defineConfig, env } from 'prisma/config';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: '../web/prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
});
