#! /usr/bin/env node
import { argv } from "node:process";
import consola from "consola";
import { BulkInstall } from "../main.js";
const args = argv.slice(2);
const opts = {};
if (args.includes("packageManager")) {
    if (!args[args.indexOf("packageManager") + 1]) {
        consola.error("No package manager provided after 'packageManager'");
    }
    if (!["npm", "yarn", "pnpm", "ni"].includes(args[args.indexOf("packageManager") + 1])) {
        consola.error("Invalid package manager provided");
    }
    opts.packageManager = args[args.indexOf("packageManager") + 1];
}
if (args.includes("parentFolder")) {
    if (!args[args.indexOf("parentFolder") + 1]) {
        consola.error("No parent folder provided after 'parentFolder'");
    }
    opts.parentFolder = args[args.indexOf("parentFolder") + 1];
}
new BulkInstall(opts).run();
