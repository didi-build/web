import {
  createHiFollowupConsumerDepsFromEnv,
  processHiFollowupQueueBatch,
} from "../../src/lib/hi/exchange/process-followup-queue";
import type { HiFollowupConsumerEnv } from "../../src/lib/hi/exchange/process-followup-queue";

const hiFollowupEmailConsumer = {
  async queue(
    batch: {
      messages: Array<{
        id: string;
        attempts: number;
        body: unknown;
        ack(): void;
        retry(options?: { delaySeconds?: number }): void;
      }>;
    },
    env: HiFollowupConsumerEnv,
  ): Promise<void> {
    const deps = createHiFollowupConsumerDepsFromEnv(env);
    await processHiFollowupQueueBatch(batch, deps);
  },
};

export default hiFollowupEmailConsumer;
