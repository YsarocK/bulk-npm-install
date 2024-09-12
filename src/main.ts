import { createConsola } from "consola";
import { InstallParameters, ResultsStatus } from "./types/index.js";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { Results } from "./utils/Results.js";

interface BulkInstall {
  parentFolder: string;
  recursive: boolean;
  results: Array<Results>;
  logger: ReturnType<typeof createConsola>;
  iterateFolders(folderPath: string): Promise<void>;
  getLockFiles(folderPath: string): Array<string>;
  runInstall(folderPath: string, packageManager: string): Promise<void>;
  run(): Promise<void>;
}

class BulkInstall {
  constructor({ parentFolder = "./", recursive = false, logs = false }: InstallParameters) {
    this.parentFolder = parentFolder;
    this.recursive = recursive;
    this.results = [];
    this.logger = logs ? createConsola() : createConsola({ level: -999 });
  }

  getLockFiles(folderPath: string) {
    const LOCK_FILES = {
      npm: fs.existsSync(path.join(folderPath, 'package-lock.json')),
      yarn: fs.existsSync(path.join(folderPath, 'yarn.lock')),
      pnpm: fs.existsSync(path.join(folderPath, 'pnpm-lock.yaml')),
    };

    const res = [];

    for (const [key, value] of Object.entries(LOCK_FILES)) {
      if (value) {
        res.push(key);
      }
    }

    return res;
  }

  runInstall(folderPath: string, packageManager: string) {
    return new Promise<void>((resolve, reject) => {
      exec(`${packageManager} install`, { cwd: folderPath }, (error) => {
        if (error) {
          this.logger.error(`Error in ${folderPath}:`, error);
          return reject(error);
        }
        this.logger.success(`${packageManager} install successfully executed in ${folderPath}`);
        resolve();
      });
    });
  }

  async iterateFolders(folderPath: string) {
    const subFolders = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(folderPath, dirent.name))
      .filter(subFolder => !subFolder.includes('node_modules'));

    for (const folder of subFolders) {
      const lockFiles = this.getLockFiles(folder);

      if (lockFiles.length > 1) {
        this.logger.warn(`Multiple lock files found in ${folder}, skipping.`);
        this.results.push(new Results(folder, 'unknown', ResultsStatus.SKIPPED));
      }

      if (lockFiles.length === 1) {
        const packageManager = lockFiles[0];
        this.logger.start(`Lock file found in ${folder}, running ${packageManager} install...`);
        await this.runInstall(folder, packageManager)
          .then(() => this.results.push(new Results(folder, packageManager, ResultsStatus.SUCCESS)))
          .catch(() => this.results.push(new Results(folder, packageManager, ResultsStatus.FAILED)));
      }

      if (this.recursive) {
        await this.iterateFolders(folder);
      }
    }
  }

  async run() {
    this.logger.start(`Starting bulk installation in folder: ${this.parentFolder}`);

    try {
      await this.iterateFolders(this.parentFolder);
      this.logger.success('All installations are completed.');
    } catch (error) {
      this.logger.error('Error during bulk installation:', error);
    }

    // eslint-disable-next-line no-console
    console.table(this.results);
  }
}

export {
  BulkInstall
};