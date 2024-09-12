import { ResultsStatus } from "../types/ResultsStatus.js";
declare class Results {
    folder: string;
    packageManager: string;
    status: ResultsStatus;
    constructor(folder: string, packageManager: string, status: ResultsStatus);
}
export { Results };
