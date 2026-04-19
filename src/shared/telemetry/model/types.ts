export type TelemetryEvent = {
  name: string;
  occurredAt: string;
  payload?: Record<string, unknown>;
};

export type TelemetryBatch = {
  events: TelemetryEvent[];
  createdAt: string;
};

export type TelemetryFlushResult = {
  acceptedCount: number;
  failedCount: number;
};

export type TelemetryQueueAdapter = {
  enqueue: (event: TelemetryEvent) => Promise<void> | void;
  flush: () => Promise<TelemetryFlushResult>;
};
