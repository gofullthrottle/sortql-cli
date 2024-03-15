import chalk from "chalk";
import { homedir } from "os";
import path from "path";
import chokidar from "chokidar";

import { readFile } from "fs/promises";

import { QueryClient } from "@sortql/core";
import { printHeader } from "@sortql/cli/dialogue";
import { checkConfig } from "@sortql/cli/config";

export const VERSION = "1.0.14";
export const GITHUB_URL = "https://github.com/leonmeka/sortql";
export const CONFIG_PATH = path.join(homedir(), ".sortql");

let isBlocked = false;

async function runQueries(client: QueryClient, queries: string) {
  if (isBlocked) {
    return;
  }

  isBlocked = true;

  try {
    const content = await readFile(queries, {
      encoding: "utf8",
    });

    await client.run(content);

    console.log(chalk.green("→ Queries ran successfully!"));
  } catch (error) {
    console.error(chalk.red("Error running queries:"), error);
  } finally {
    isBlocked = false;
  }
}

async function watchDirectory(
  client: QueryClient,
  config: {
    directory: string;
    queries: string;
    watch: boolean;
  }
) {
  chokidar
    .watch(config.directory, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignorePermissionErrors: true,
      interval: 100,
    })
    .on("all", async () => {
      if (isBlocked) {
        return;
      }

      printHeader(config);
      await runQueries(client, config.queries);
    });
}

export async function initSortQLCLI() {
  printHeader();
  const config = await checkConfig();

  const client = new QueryClient(config.directory);

  if (config.watch) {
    await watchDirectory(client, config);
  }

  if (!config.watch) {
    printHeader(config);
    await runQueries(client, config.queries);
  }
}
