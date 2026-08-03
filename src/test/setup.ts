import { beforeEach } from "vitest";
import { resetSharedSchedulerForTests } from "@/shared/scheduler";

beforeEach(() => {
  resetSharedSchedulerForTests();
});
