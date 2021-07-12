import { pipe, tap } from 'wonka';
import { Exchange, Operation, OperationResult } from '../types';

const defaultIncomingLog = (op: Operation) =>
  // eslint-disable-next-line no-console
  console.log('[Exchange debug]: Incoming operation: ', op);
const defaultCompletedLog = (result: OperationResult) =>
  // eslint-disable-next-line no-console
  console.log('[Exchange debug]: Completed operation: ', result);

export interface DebugExchangeOptions {
  onIncoming?: (op: Operation) => void;
  onCompleted?: (result: OperationResult) => void;
}

export const debugExchange = (options: DebugExchangeOptions): Exchange => ({
  forward,
}) => {
  if (process.env.NODE_ENV === 'production') {
    return ops$ => forward(ops$);
  } else {
    const {
      onIncoming = defaultIncomingLog,
      onCompleted = defaultCompletedLog,
    } = options || {};
    return ops$ => pipe(ops$, tap(onIncoming), forward, tap(onCompleted));
  }
};
