import consola from "consola";
import { InstallParameters } from "./types/index.js";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

consola.wrapAll();

interface BulkInstall {
  parentFolder: string;
  packageManager: string;
  getLockFiles(folderPath: string): Array<string>;
  runInstall(folderPath: string, packageManager: string): Promise<void>;
  iterateFolders(): Promise<void>;
  run(): Promise<void>;
}

class BulkInstall {
  constructor({ parentFolder = "./" }: InstallParameters) {
    this.parentFolder = parentFolder;
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
          consola.error(`Erreur dans ${folderPath}:`, error);
          return reject(error);
        }
        consola.success(`${this.packageManager} install exécuté avec succès dans ${folderPath}`);
        resolve();
      });
    });
  }

  async iterateFolders() {
    const subFolders = fs.readdirSync(this.parentFolder, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(this.parentFolder, dirent.name));

    for (const folder of subFolders) {
      const lockFiles = this.getLockFiles(folder);

      if (lockFiles.length > 1) {
        consola.warn(`Plusieurs lock files trouvés dans ${folder}, skip.`);
      }

      if (lockFiles.length === 1) {
        const packageManager = lockFiles[0];
        consola.info(`Lock file trouvé dans ${folder}, exécution de ${packageManager} install...`);
        await this.runInstall(folder, packageManager);
      }

      if (lockFiles.length === 0) {
        consola.warn(`Aucun lock file trouvé dans ${folder}, skip.`);
      }
    }
  }

  async run() {
    consola.start(`Démarrage de l'installation en bulk dans le dossier: ${this.parentFolder}`);

    try {
      await this.iterateFolders();
      consola.success('Tous les installs sont terminés.');
    } catch (error) {
      consola.error('Erreur pendant l\'installation:', error);
    }
  }
}

export {
  BulkInstall
};