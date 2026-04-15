import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const ENV_PATH = resolve(process.cwd(), ".env.local");
const WEBHOOK_URL = "https://purepeptides.ae/api/webhooks/ziina";
const ZIINA_API = "https://api-v2.ziina.com/api/webhook";

function loadEnvVar(name: string): string {
  if (!existsSync(ENV_PATH)) {
    console.error(`Error: ${ENV_PATH} not found`);
    process.exit(1);
  }
  const contents = readFileSync(ENV_PATH, "utf-8");
  const match = contents.match(new RegExp(`^${name}=(.+)$`, "m"));
  if (!match) {
    console.error(`Error: ${name} not found in .env.local`);
    process.exit(1);
  }
  return match[1].trim();
}

function upsertEnvVar(name: string, value: string): void {
  let contents = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf-8") : "";
  const pattern = new RegExp(`^${name}=.*$`, "m");
  if (pattern.test(contents)) {
    contents = contents.replace(pattern, `${name}=${value}`);
  } else {
    contents = contents.trimEnd() + `\n${name}=${value}\n`;
  }
  writeFileSync(ENV_PATH, contents);
}

async function main() {
  const accessToken = loadEnvVar("ZIINA_ACCESS_TOKEN");
  const secret = randomBytes(32).toString("hex");

  console.log("Registering Ziina webhook...");
  console.log(`  URL: ${WEBHOOK_URL}`);

  const res = await fetch(ZIINA_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url: WEBHOOK_URL, secret }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Ziina API error (${res.status}): ${body}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log("Ziina response:", JSON.stringify(data, null, 2));

  upsertEnvVar("ZIINA_WEBHOOK_SECRET", secret);
  console.log(`\nZIINA_WEBHOOK_SECRET written to .env.local`);
  console.log(`Secret: ${secret}`);
  console.log(
    `\n⚠  Remember to add ZIINA_WEBHOOK_SECRET to your Netlify environment variables.`
  );
}

main();
