import { InstallParameters } from "./types/index.js";
interface BulkInstall extends InstallParameters {
}
declare class BulkInstall {
    constructor({ packageManager, parentFolder }: {
        packageManager?: string;
        parentFolder?: string;
    });
    hasPackageJson(folderPath: string): boolean;
    runInstall(folderPath: string): Promise<void>;
    iterateFolders(): Promise<void>;
    run(): Promise<void>;
}
export { BulkInstall };
