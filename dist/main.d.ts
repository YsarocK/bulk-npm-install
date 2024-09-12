import { createConsola } from "consola";
import { InstallParameters } from "./types/index.js";
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
declare class BulkInstall {
    constructor({ parentFolder, recursive, logs }: InstallParameters);
}
export { BulkInstall };
