import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './app/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.CONNECTION_STRING!,
  },
});
