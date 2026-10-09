import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

let contents = readFileSync(
  existsSync(".env") ? ".env" : ".env.example",
  "utf8",
);
if (/NEXTAUTH_SECRET="GENERATE_WITH_NPM_RUN_ENV_SETUP"/.test(contents)) {
  contents = contents.replace(
    'NEXTAUTH_SECRET="GENERATE_WITH_NPM_RUN_ENV_SETUP"',
    `NEXTAUTH_SECRET="${randomBytes(48).toString("base64url")}"`,
  );
}
writeFileSync(".env", contents, { mode: 0o600 });
mkdirSync("storage/uploads", { recursive: true });
if (
  /DATABASE_URL="file:\.\/dev\.db"/.test(contents) &&
  !existsSync("prisma/dev.db")
) {
  writeFileSync("prisma/dev.db", Buffer.alloc(0), { flag: "wx" });
}
console.log(
  "Local environment ready. Existing settings were preserved; the authentication secret stays in .env.",
);
