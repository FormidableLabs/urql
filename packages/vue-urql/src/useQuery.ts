import { inject, Ref, unref, ref, isRef, watchEffect } from 'vue';
import { DocumentNode } from 'graphql';
import { pipe, take, publish, share, onPush, toPromise, onEnd } from 'wonka';

import {
  OperationResult,
  TypedDocumentNode,
  CombinedError,
  OperationContext,
  RequestPolicy,
  Operation,
  Client,
  createRequest,
  GraphQLRequest,
} from '@urql/core';

type MaybeRef<T> = T | Ref<T>;

export interface UseQueryArgs<T, V> {
  query: MaybeRef<string | TypedDocumentNode<T, V> | DocumentNode>;
  variables?: MaybeRef<V>;
  requestPolicy?: MaybeRef<RequestPolicy>;
  pollInterval?: MaybeRef<number>;
  context?: MaybeRef<Partial<OperationContext>>;
  pause?: MaybeRef<boolean>;
}

export interface UseQueryState<T, V> {
  fetching: Ref<boolean>;
  stale: Ref<boolean>;
  data: Ref<T | undefined>;
  error: Ref<CombinedError | undefined>;
  extensions: Ref<Record<string, any> | undefined>;
  operation: Ref<Operation<T, V> | undefined>;
  isPaused: Ref<boolean>;
  resume(): void;
  pause(): void;
  executeQuery(): PromiseLike<OperationResult<T, V>>;
}

export type UseQueryResponse<T, V> = UseQueryState<T, V> &
  PromiseLike<UseQueryState<T, V>>;

export function useQuery<T = any, V = object>(
  args: UseQueryArgs<T, V>
): UseQueryResponse<T, V> {
  const client = inject('$urql') as Client;

  if (process.env.NODE_ENV !== 'production' && !client) {
    throw new Error(
      'Cannot detect urql Client, did you forget to call `useClient`?'
    );
  }

  const data: Ref<T | undefined> = ref();
  const stale: Ref<boolean> = ref(false);
  const fetching: Ref<boolean> = ref(false);
  const error: Ref<CombinedError | undefined> = ref();
  const operation: Ref<Operation<T, V> | undefined> = ref();
  const extensions: Ref<Record<string, any> | undefined> = ref();

  const unsubscribe: Ref<() => void> = ref(() => {
    /* noop */
  });

  const isPaused: Ref<boolean> = isRef(args.pause)
    ? args.pause
    : ref(!!args.pause);

  const request: Ref<GraphQLRequest<T, V>> = ref(
    createRequest<T, V>(unref(args.query), unref(args.variables) as V) as any
  );

  watchEffect(
    () => {
      const newRequest = createRequest<T, V>(
        unref(args.query),
        unref(args.variables) as any
      );
      if (request.value.key !== newRequest.key) {
        request.value = newRequest;
      }
    },
    {
      flush: 'sync',
    }
  );

  let isThenable = false;

  const executeQuery = () => {
    fetching.value = true;

    const query$ = pipe(
      client.executeQuery<T, V>(request.value, {
        requestPolicy: unref(args.requestPolicy),
        pollInterval: unref(args.pollInterval),
        ...unref(args.context),
      }),
      onEnd(() => {
        fetching.value = false;
      }),
      onPush(res => {
        isThenable = false;
        data.value = res.data;
        stale.value = !!res.stale;
        fetching.value = false;
        error.value = res.error;
        operation.value = res.operation;
        extensions.value = res.extensions;
      }),
      share
    );

    if (!isThenable) {
      unsubscribe.value();
      unsubscribe.value = publish(query$).unsubscribe;
    }

    return {
      then(onFulfilled, onRejected) {
        return pipe(query$, take(1), toPromise).then(onFulfilled, onRejected);
      },
    } as PromiseLike<OperationResult<T, V>>;
  };

  watchEffect(
    onInvalidate => {
      if (!isPaused.value) {
        executeQuery();
        onInvalidate(() => {
          unsubscribe.value();
        });
      }
    },
    {
      flush: 'pre',
    }
  );

  const result = {
    data,
    stale,
    error,
    operation,
    extensions,
    fetching,
    executeQuery,
    isPaused,
    pause() {
      isPaused.value = true;
    },
    resume() {
      isPaused.value = false;
    },
  };

  return {
    ...result,
    then(onFulfilled, onRejected) {
      isThenable = true;
      return executeQuery()
        .then(() => result)
        .then(onFulfilled, onRejected);
    },
  };
}
