#! /usr/bin/env node
import { argv } from "node:process";
import consola from "consola";
import { BulkInstall } from "../main.js";
const args = argv.slice(2);
const opts = {};
if (args.includes("parentFolder")) {
    if (!args[args.indexOf("parentFolder") + 1]) {
        consola.error("No parent folder provided after 'parentFolder'");
    }
    opts.parentFolder = args[args.indexOf("parentFolder") + 1];
}
new BulkInstall(opts).run();
