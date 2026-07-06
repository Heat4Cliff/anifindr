// @ts-nocheck
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env
import * as dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL!;

export default defineConfig({
  schema: "./prisma/schema.prisma",
  // url required for migrate commands in Prisma v7
  datasource: {
    url: DATABASE_URL,
  },
  migrate: {
    async adapter() {
      const pool = new Pool({ connectionString: DATABASE_URL });
      return new PrismaPg(pool);
    },
  },
});
