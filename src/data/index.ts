import { demoApplications } from "./applications";
import { demoDocuments } from "./documents";
import { demoEvents } from "./events";
import { demoTasks } from "./tasks";
import type { JobTrackData } from "../types";

export { demoApplications } from "./applications";
export { demoDocuments } from "./documents";
export { demoEvents } from "./events";
export { demoTasks } from "./tasks";

export const demoData: JobTrackData = {
  applications: demoApplications,
  events: demoEvents,
  tasks: demoTasks,
  documents: demoDocuments,
};
