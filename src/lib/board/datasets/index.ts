import type { Dataset, DatasetName } from "../types";
import { early } from "./early";
import { full } from "./full";

const DATASETS: Record<DatasetName, Dataset> = { early, full };

/**
 * `?data=early` on any route. Anything else, including nothing, gives `full`.
 * The switch lives in the URL so a link opens the right board on a phone, and it
 * never appears in the product UI: a visitor must not see two versions of the truth.
 */
export function getDataset(name: string | string[] | undefined): Dataset {
  return name === "early" ? DATASETS.early : DATASETS.full;
}
