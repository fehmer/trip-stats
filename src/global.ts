import { update } from "./main";
import type { FitFile } from "./utils/fit-parser";

let fitFile: FitFile | undefined;

export function getFitFile(): FitFile | undefined {
  return fitFile;
}

export function setFitFile(file: FitFile | undefined): void {
  fitFile = file;
  update();
}
