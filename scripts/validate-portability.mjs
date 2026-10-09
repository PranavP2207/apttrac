import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
mkdirSync(".tmp", { recursive: true });
const schema = readFileSync("prisma/schema.prisma", "utf8").replace(
  /provider\s*=\s*"sqlite"/,
  'provider = "postgresql"',
);
writeFileSync(".tmp/schema-postgres.prisma", schema);
execFileSync(
  process.execPath,
  [
    "node_modules/prisma/build/index.js",
    "validate",
    "--schema",
    ".tmp/schema-postgres.prisma",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "postgresql://validation:validation@localhost:5432/apttrac",
    },
  },
);
