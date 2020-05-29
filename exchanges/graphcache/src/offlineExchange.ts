import { pipe, filter } from 'wonka';
import { print, SelectionNode } from 'graphql';

import {
  Operation,
  GraphQLRequest,
  Exchange,
  CombinedError,
  createRequest,
} from '@urql/core';

import {
  getMainOperation,
  getFragments,
  isInlineFragment,
  isFieldNode,
  shouldInclude,
  getSelectionSet,
  getName,
} from './ast';

import { makeDict } from './helpers/dict';
import { OptimisticMutationConfig, Variables } from './types';
import { cacheExchange, CacheExchangeOpts } from './cacheExchange';

/** Determines whether a given query contains an optimistic mutation field */
const isOptimisticMutation = (
  config: OptimisticMutationConfig,
  operation: Operation
) => {
  if (operation.operationName !== 'mutation') {
    return false;
  }

  const vars: Variables = operation.variables || makeDict();
  const fragments = getFragments(operation.query);
  const selections = [...getSelectionSet(getMainOperation(operation.query))];

  let field: void | SelectionNode;
  while ((field = selections.pop())) {
    if (!shouldInclude(field, vars)) {
      continue;
    } else if (!isFieldNode(field)) {
      const fragmentNode = !isInlineFragment(field)
        ? fragments[getName(field)]
        : field;
      if (fragmentNode) selections.push(...getSelectionSet(fragmentNode));
    } else if (config[getName(field)]) {
      return true;
    }
  }

  return false;
};

const isOfflineError = (error: undefined | CombinedError) =>
  error &&
  error.networkError &&
  !error.response &&
  ((typeof navigator !== 'undefined' && navigator.onLine === false) ||
    /request failed|failed to fetch|network\s?error/i.test(
      error.networkError.message
    ));

export const offlineExchange = (opts: CacheExchangeOpts): Exchange => ({
  forward,
  client,
  dispatchDebug,
}) => {
  const { storage } = opts;

  if (
    storage &&
    storage.onOnline &&
    storage.readMetadata &&
    storage.writeMetadata
  ) {
    const optimisticMutations = opts.optimistic || {};
    const failedQueue: GraphQLRequest[] = [];

    const updateMetadata = () => {
      storage.writeMetadata!(
        failedQueue.map(op => ({
          query: print(op.query),
          variables: op.variables,
        }))
      );
    };

    let _flushing = false;
    const flushQueue = () => {
      let request: void | GraphQLRequest;
      while (!_flushing && (request = failedQueue.shift())) {
        _flushing = true;
        client.dispatchOperation(
          client.createRequestOperation('mutation', request)
        );
        _flushing = false;
      }

      updateMetadata();
    };

    forward = ops$ => {
      return pipe(
        forward(ops$),
        filter(res => {
          if (
            res.operation.operationName !== 'subscription' &&
            isOfflineError(res.error)
          ) {
            if (isOptimisticMutation(optimisticMutations, res.operation)) {
              failedQueue.push(res.operation);
              updateMetadata();
            }

            return false;
          }

          return true;
        })
      );
    };

    storage.onOnline(flushQueue);
    storage.readMetadata().then(mutations => {
      for (let i = 0; i < mutations.length; i++)
        failedQueue.push(
          createRequest(mutations[i].query, mutations[i].variables)
        );
      flushQueue();
    });
  }

  return cacheExchange(opts)({
    forward,
    client,
    dispatchDebug,
  });
};
