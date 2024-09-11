import { InstallParameters } from "./types/index.js";
interface BulkInstall {
    parentFolder: string;
    packageManager: string;
    hasPackageJson(folderPath: string): boolean;
    runInstall(folderPath: string): Promise<void>;
    iterateFolders(): Promise<void>;
    run(): Promise<void>;
}
declare class BulkInstall {
    constructor({ packageManager, parentFolder }: InstallParameters);
}
export { BulkInstall };
