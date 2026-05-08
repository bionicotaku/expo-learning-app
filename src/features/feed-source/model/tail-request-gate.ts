export type TailRequestGate = {
  canStart: (tailVideoId: string | null) => boolean;
  markSettled: (tailVideoId: string) => void;
  markStarted: (tailVideoId: string) => void;
  markSucceeded: (tailVideoId: string) => void;
};

export function createTailRequestGate(): TailRequestGate {
  let fulfilledTailVideoId: string | null = null;
  let inFlightTailVideoId: string | null = null;

  return {
    canStart(tailVideoId) {
      return (
        tailVideoId !== null &&
        inFlightTailVideoId === null &&
        fulfilledTailVideoId !== tailVideoId
      );
    },
    markSettled(tailVideoId) {
      if (inFlightTailVideoId === tailVideoId) {
        inFlightTailVideoId = null;
      }
    },
    markStarted(tailVideoId) {
      inFlightTailVideoId = tailVideoId;
    },
    markSucceeded(tailVideoId) {
      fulfilledTailVideoId = tailVideoId;
    },
  };
}
