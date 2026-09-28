import { createVisibilityPipelineFromEnv } from "@/lib/visibility/composition";
import { createVisibilityCheckHandler } from "@/lib/visibility/visibility-handler";

export const POST = createVisibilityCheckHandler(createVisibilityPipelineFromEnv);
