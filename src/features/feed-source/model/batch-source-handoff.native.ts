import { unstable_batchedUpdates } from 'react-native';

export function batchSourceHandoff(callback: () => void) {
  unstable_batchedUpdates(callback);
}
