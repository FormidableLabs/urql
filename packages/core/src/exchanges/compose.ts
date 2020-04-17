import { Exchange, ExchangeInput } from '../types';

/** This composes an array of Exchanges into a single ExchangeIO function */
export const composeExchanges = (exchanges: Exchange[]) => ({
  client,
  forward,
}: Omit<ExchangeInput, 'dispatchDebug'>) =>
  exchanges.reduceRight(
    (forward, exchange) =>
      exchange({
        client,
        forward,
        dispatchDebug: e =>
          client.debugSubject!.next({
            ...e,
            timestamp: Date.now(),
            source: exchange.name,
          }),
      }),
    forward
  );
