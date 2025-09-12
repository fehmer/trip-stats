import { update } from "./main";
import type { FitFile } from "./utils/fit-parser";

export class FitFileStore {
  private static fitFile: FitFile | undefined;

  static get(): FitFile | undefined {
    return FitFileStore.fitFile;
  }

  static set(file: FitFile | undefined): void {
    FitFileStore.fitFile = file;
    update();
  }
}
