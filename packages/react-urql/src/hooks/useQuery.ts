import { DocumentNode } from 'graphql';
import { Source, pipe, subscribe, onEnd, onPush, takeWhile } from 'wonka';
import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  Client,
  TypedDocumentNode,
  CombinedError,
  OperationContext,
  RequestPolicy,
  OperationResult,
  Operation,
} from '@urql/core';

import { useClient } from '../context';
import { useRequest } from './useRequest';
import { getCacheForClient } from './cache';
import { initialState, computeNextState, hasDepsChanged } from './state';

export interface UseQueryArgs<Variables = object, Data = any> {
  query: string | DocumentNode | TypedDocumentNode<Data, Variables>;
  variables?: Variables;
  requestPolicy?: RequestPolicy;
  pollInterval?: number;
  context?: Partial<OperationContext>;
  pause?: boolean;
}

export interface UseQueryState<Data = any, Variables = object> {
  fetching: boolean;
  stale: boolean;
  data?: Data;
  error?: CombinedError;
  extensions?: Record<string, any>;
  operation?: Operation<Data, Variables>;
}

export type UseQueryResponse<Data = any, Variables = object> = [
  UseQueryState<Data, Variables>,
  (opts?: Partial<OperationContext>) => void
];

const isSuspense = (client: Client, context?: Partial<OperationContext>) =>
  client.suspense && (!context || context.suspense !== false);

export function useQuery<Data = any, Variables = object>(
  args: UseQueryArgs<Variables, Data>
): UseQueryResponse<Data, Variables> {
  const client = useClient();
  const cache = getCacheForClient(client);
  const suspense = isSuspense(client, args.context);
  const request = useRequest<Data, Variables>(args.query, args.variables);

  const source = useMemo(() => {
    if (args.pause) return null;

    const source = client.executeQuery(request, {
      requestPolicy: args.requestPolicy,
      pollInterval: args.pollInterval,
      ...args.context,
    });

    return suspense
      ? pipe(
          source,
          onPush(result => {
            cache.set(request.key, result);
          })
        )
      : source;
  }, [
    client,
    request,
    suspense,
    args.pause,
    args.requestPolicy,
    args.pollInterval,
    args.context,
  ]);

  const getSnapshot = useCallback(
    (
      suspense: boolean,
      source: Source<OperationResult<Data, Variables>> | null
    ): Partial<UseQueryState<Data, Variables>> => {
      if (!source) return { fetching: false };

      let result = cache.get(request.key);
      if (!result) {
        let resolve: (value: unknown) => void;

        const subscription = pipe(
          source,
          takeWhile(() => (suspense && !resolve) || !result),
          subscribe(_result => {
            result = _result;
            if (resolve) resolve(result);
          })
        );

        if (result == null && suspense) {
          const promise = new Promise(_resolve => {
            resolve = _resolve;
          });

          cache.set(request.key, promise);
          throw promise;
        } else {
          subscription.unsubscribe();
        }
      } else if (suspense && result != null && 'then' in result) {
        throw result;
      }

      return (result as OperationResult<Data, Variables>) || { fetching: true };
    },
    [request]
  );

  const deps = [
    client,
    request,
    args.requestPolicy,
    args.pollInterval,
    args.context,
    args.pause,
  ] as const;

  const [state, setState] = useState(
    () =>
      [
        source,
        getSnapshot,
        computeNextState(initialState, getSnapshot(suspense, source)),
        deps,
      ] as const
  );

  let currentResult = state[2];
  if (source !== state[0] && hasDepsChanged(state[3], deps)) {
    setState([
      source,
      getSnapshot,
      (currentResult = computeNextState(
        state[2],
        getSnapshot(suspense, source)
      )),
      deps,
    ]);
  }

  useEffect(() => {
    const source = state[0];
    const request = state[3][1];

    let hasResult = false;

    const updateResult = (result: Partial<UseQueryState<Data, Variables>>) => {
      hasResult = true;
      setState(state => {
        const nextResult = computeNextState(state[2], result);
        return state[2] !== nextResult
          ? [state[0], state[1], nextResult, state[3]]
          : state;
      });
    };

    if (source) {
      const subscription = pipe(
        source,
        onEnd(() => {
          updateResult({ fetching: false });
        }),
        subscribe(updateResult)
      );

      if (!hasResult) updateResult({ fetching: true });

      return () => {
        cache.dispose(request.key);
        subscription.unsubscribe();
      };
    } else {
      updateResult({ fetching: false });
    }
  }, [cache, state[0], state[3][1]]);

  const executeQuery = useCallback((opts?: Partial<OperationContext>) => {
    const source = client.executeQuery(request, {
      requestPolicy: args.requestPolicy,
      pollInterval: args.pollInterval,
      ...args.context,
      ...opts,
    });

    setState(state => [source, state[1], state[2], state[3]]);
  }, []);

  return [currentResult, executeQuery];
}
