import { InstallParameters } from "./types/index.js";
interface BulkInstall {
    parentFolder: string;
    packageManager: string;
    getLockFiles(folderPath: string): Array<string>;
    runInstall(folderPath: string, packageManager: string): Promise<void>;
    iterateFolders(): Promise<void>;
    run(): Promise<void>;
}
declare class BulkInstall {
    constructor({ parentFolder }: InstallParameters);
}
export { BulkInstall };
