import { createConsola } from "consola";
import { ResultsStatus } from "./types/index.js";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { Results } from "./utils/Results.js";
class BulkInstall {
    constructor({ parentFolder = "./", recursive = false, logs = false }) {
        this.parentFolder = parentFolder;
        this.recursive = recursive;
        this.results = [];
        this.logger = logs ? createConsola() : createConsola({ level: -999 });
    }
    getLockFiles(folderPath) {
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
    runInstall(folderPath, packageManager) {
        return new Promise((resolve, reject) => {
            exec(`${packageManager} install`, { cwd: folderPath }, (error) => {
                if (error) {
                    this.logger.error(`Erreur dans ${folderPath}:`, error);
                    return reject(error);
                }
                this.logger.success(`${packageManager} install exécuté avec succès dans ${folderPath}`);
                resolve();
            });
        });
    }
    async iterateFolders(folderPath) {
        const subFolders = fs.readdirSync(folderPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(folderPath, dirent.name))
            .filter(subFolder => !subFolder.includes('node_modules'));
        for (const folder of subFolders) {
            const lockFiles = this.getLockFiles(folder);
            if (lockFiles.length > 1) {
                this.logger.warn(`Plusieurs lock files trouvés dans ${folder}, skip.`);
                this.results.push(new Results(folder, 'unknown', ResultsStatus.SKIPPED));
            }
            if (lockFiles.length === 1) {
                const packageManager = lockFiles[0];
                this.logger.start(`Lock file trouvé dans ${folder}, exécution de ${packageManager} install...`);
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
        this.logger.start(`Démarrage de l'installation en bulk dans le dossier: ${this.parentFolder}`);
        try {
            await this.iterateFolders(this.parentFolder);
            this.logger.success('Tous les installs sont terminés.');
        }
        catch (error) {
            this.logger.error('Erreur lors de l\'installation en bulk:', error);
        }
        // eslint-disable-next-line no-console
        console.table(this.results);
    }
}
export { BulkInstall };
