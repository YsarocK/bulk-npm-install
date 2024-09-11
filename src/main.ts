import consola from "consola";
import { InstallParameters } from "./types/index.js";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

consola.wrapAll();

interface BulkInstall extends InstallParameters { }

class BulkInstall {
  constructor({ packageManager = "npm", parentFolder = "./" }) {
    this.packageManager = packageManager;
    this.parentFolder = parentFolder;
  }

  hasPackageJson(folderPath: string) {
    return fs.existsSync(path.join(folderPath, 'package.json'));
  }

  runInstall(folderPath: string) {
    return new Promise<void>((resolve, reject) => {
      exec(`${this.packageManager} install`, { cwd: folderPath }, (error, stdout, stderr) => {
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
      if (this.hasPackageJson(folder)) {
        consola.info(`package.json trouvé dans ${folder}, exécution de ${this.packageManager} install...`);
        await this.runInstall(folder);
      } else {
        consola.warn(`Pas de package.json dans ${folder}, skip.`);
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
}