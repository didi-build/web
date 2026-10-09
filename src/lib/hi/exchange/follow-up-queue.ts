export type HiFollowupEmailMessage = {
  issueId: string;
  name: string;
  email: string;
};

export interface HiFollowUpQueue {
  enqueue(message: HiFollowupEmailMessage): Promise<void>;
}

export class CloudflareHiFollowUpQueue implements HiFollowUpQueue {
  constructor(
    private readonly queue: {
      send(body: HiFollowupEmailMessage): Promise<unknown>;
    },
  ) {}

  async enqueue(message: HiFollowupEmailMessage): Promise<void> {
    await this.queue.send(message);
  }
}
