#! /usr/bin/env node
import { argv } from "node:process";
import type { InstallParameters } from "../types/index.js";
import consola from "consola";
import { BulkInstall } from "../main.js";

const args = argv.slice(2);

const opts: InstallParameters = {};

if (args.includes("-F")) {
  if (!args[args.indexOf("-F") + 1]) {
    consola.error("No parent folder provided after 'parentFolder'");
  }

  opts.parentFolder = args[args.indexOf("-F") + 1];
}

if (args.includes("-R")) {
  opts.recursive = true;
}

if (args.includes("-L")) {
  opts.logs = true;
}

new BulkInstall(opts).run();