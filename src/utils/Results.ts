import { ResultsStatus } from "../types/ResultsStatus.js";

class Results {
  folder: string;
  packageManager: string;
  status: ResultsStatus;

  constructor(folder: string, packageManager: string, status: ResultsStatus) {
    this.folder = folder;
    this.packageManager = packageManager;
    this.status = status;
  }
}

export {
  Results
};