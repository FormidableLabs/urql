import { print } from 'graphql';
import gql from 'graphql-tag';

/** NOTE: Testing in this file is designed to test both the client and it's interaction with default Exchanges */

import { map, pipe, subscribe, filter, toArray, tap } from 'wonka';
import { Exchange, Operation, OperationResult } from './types';
import { createClient } from './client';
import { queryOperation } from './test-utils';

const url = 'https://hostname.com';

describe('createClient', () => {
  it('passes snapshot', () => {
    const c = createClient({
      url,
    });

    expect(c).toMatchSnapshot();
  });
});

const query = {
  key: 1,
  query: gql`
    {
      todos {
        id
      }
    }
  `,
  variables: { example: 1234 },
};

let receivedOps: any[] = [];
let client = createClient({ url: '1234' });
const receiveMock = jest.fn(s =>
  pipe(
    s,
    tap(op => (receivedOps = [...receivedOps, op])),
    map(op => ({ operation: op }))
  )
);
const exchangeMock = jest.fn(() => receiveMock);

beforeEach(() => {
  receivedOps = [];
  exchangeMock.mockClear();
  receiveMock.mockClear();
  client = createClient({
    url,
    exchanges: [exchangeMock] as any[],
    requestPolicy: 'cache-and-network',
  });
});

describe('exchange args', () => {
  it('receives forward function', () => {
    // @ts-ignore
    expect(typeof exchangeMock.mock.calls[0][0].forward).toBe('function');
  });

  it('receives client', () => {
    // @ts-ignore
    expect(exchangeMock.mock.calls[0][0]).toHaveProperty('client', client);
  });
});

describe('promisified methods', () => {
  it('query', () => {
    const queryResult = client
      .query(
        gql`
          {
            todos {
              id
            }
          }
        `,
        { example: 1234 },
        { requestPolicy: 'cache-only' }
      )
      .toPromise();

    const received = receivedOps[0];
    expect(print(received.query)).toEqual(print(query.query));
    expect(received.key).toBeDefined();
    expect(received.variables).toEqual({ example: 1234 });
    expect(received.operationName).toEqual('query');
    expect(received.context).toEqual({
      url: 'https://hostname.com',
      requestPolicy: 'cache-only',
      fetchOptions: undefined,
      fetch: undefined,
      suspense: false,
      preferGetMethod: false,
    });
    expect(queryResult).toHaveProperty('then');
  });

  it('mutation', () => {
    const mutationResult = client
      .mutation(
        gql`
          {
            todos {
              id
            }
          }
        `,
        { example: 1234 }
      )
      .toPromise();

    const received = receivedOps[0];
    expect(print(received.query)).toEqual(print(query.query));
    expect(received.key).toBeDefined();
    expect(received.variables).toEqual({ example: 1234 });
    expect(received.operationName).toEqual('mutation');
    expect(received.context).toEqual({
      url: 'https://hostname.com',
      requestPolicy: 'cache-and-network',
      fetchOptions: undefined,
      fetch: undefined,
      preferGetMethod: false,
    });
    expect(mutationResult).toHaveProperty('then');
  });
});

describe('synchronous methods', () => {
  it('readQuery', () => {
    const result = client.readQuery(
      gql`
        {
          todos {
            id
          }
        }
      `,
      { example: 1234 }
    );

    expect(receivedOps.length).toBe(2);
    expect(receivedOps[0].operationName).toBe('query');
    expect(receivedOps[1].operationName).toBe('teardown');
    expect(result).toEqual({
      operation: {
        ...query,
        context: expect.anything(),
        key: expect.any(Number),
        operationName: 'query',
      },
    });
  });
});

describe('executeQuery', () => {
  it('passes query string exchange', () => {
    pipe(
      client.executeQuery(query),
      subscribe(x => x)
    );

    const receivedQuery = receivedOps[0].query;
    expect(print(receivedQuery)).toBe(print(query.query));
  });

  it('passes variables type to exchange', () => {
    pipe(
      client.executeQuery(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('variables', query.variables);
  });

  it('passes requestPolicy to exchange', () => {
    pipe(
      client.executeQuery(query),
      subscribe(x => x)
    );

    expect(receivedOps[0].context).toHaveProperty(
      'requestPolicy',
      'cache-and-network'
    );
  });

  it('allows overriding the requestPolicy', () => {
    pipe(
      client.executeQuery(query, { requestPolicy: 'cache-first' }),
      subscribe(x => x)
    );

    expect(receivedOps[0].context).toHaveProperty(
      'requestPolicy',
      'cache-first'
    );
  });

  it('passes operationName type to exchange', () => {
    pipe(
      client.executeQuery(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('operationName', 'query');
  });

  it('passes url (from context) to exchange', () => {
    pipe(
      client.executeQuery(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('context.url', url);
  });

  it('polls when pollInterval is specified', () => {
    jest.useFakeTimers();
    const { unsubscribe } = pipe(
      client.executeQuery(query, { pollInterval: 100 }),
      subscribe(x => x)
    );

    expect(receivedOps.length).toEqual(1);
    jest.advanceTimersByTime(200);
    expect(receivedOps.length).toEqual(5);
    expect(receivedOps[0].operationName).toEqual('query');
    expect(receivedOps[1].operationName).toEqual('teardown');
    expect(receivedOps[2].operationName).toEqual('query');
    expect(receivedOps[3].operationName).toEqual('teardown');
    expect(receivedOps[4].operationName).toEqual('query');
    unsubscribe();
  });
});

describe('executeMutation', () => {
  it('passes query string exchange', async () => {
    pipe(
      client.executeMutation(query),
      subscribe(x => x)
    );

    const receivedQuery = receivedOps[0].query;
    expect(print(receivedQuery)).toBe(print(query.query));
  });

  it('passes variables type to exchange', () => {
    pipe(
      client.executeMutation(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('variables', query.variables);
  });

  it('passes operationName type to exchange', () => {
    pipe(
      client.executeMutation(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('operationName', 'mutation');
  });

  it('passes url (from context) to exchange', () => {
    pipe(
      client.executeMutation(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('context.url', url);
  });
});

describe('executeSubscription', () => {
  it('passes query string exchange', async () => {
    pipe(
      client.executeSubscription(query),
      subscribe(x => x)
    );

    const receivedQuery = receivedOps[0].query;
    expect(print(receivedQuery)).toBe(print(query.query));
  });

  it('passes variables type to exchange', () => {
    pipe(
      client.executeSubscription(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('variables', query.variables);
  });

  it('passes operationName type to exchange', () => {
    pipe(
      client.executeSubscription(query),
      subscribe(x => x)
    );

    expect(receivedOps[0]).toHaveProperty('operationName', 'subscription');
  });
});

describe('queuing behavior', () => {
  it('queues reexecuteOperation, which dispatchOperation consumes', () => {
    const output: Array<Operation | OperationResult> = [];

    const exchange: Exchange = ({ client }) => ops$ => {
      return pipe(
        ops$,
        filter(op => op.operationName !== 'teardown'),
        tap(op => {
          output.push(op);
          if (
            op.key === queryOperation.key &&
            op.context.requestPolicy === 'cache-first'
          ) {
            client.reexecuteOperation({
              ...op,
              context: {
                ...op.context,
                requestPolicy: 'network-only',
              },
            });
          }
        }),
        map(op => ({
          data: op.key,
          operation: op,
        }))
      );
    };

    const client = createClient({
      url: 'test',
      exchanges: [exchange],
    });

    pipe(
      client.results$,
      subscribe(result => {
        output.push(result);
      })
    );

    const results = pipe(
      client.executeRequestOperation(queryOperation),
      toArray
    );

    expect(output.length).toBe(4);
    expect(results.length).toBe(2);

    expect(output[0]).toHaveProperty('key', queryOperation.key);
    expect(output[0]).toHaveProperty('context.requestPolicy', 'cache-first');

    expect(output[1]).toHaveProperty('operation.key', queryOperation.key);
    expect(output[1]).toHaveProperty(
      'operation.context.requestPolicy',
      'cache-first'
    );

    expect(output[2]).toHaveProperty('key', queryOperation.key);
    expect(output[2]).toHaveProperty('context.requestPolicy', 'network-only');

    expect(output[3]).toHaveProperty('operation.key', queryOperation.key);
    expect(output[3]).toHaveProperty(
      'operation.context.requestPolicy',
      'network-only'
    );

    expect(output[1]).toBe(results[0]);
    expect(output[3]).toBe(results[1]);
  });
});

describe('debugSource', () => {
  it('publishes debug events', () => {
    const client = createClient({
      url: 'test',
      exchanges: [],
    });

    const event = {
      type: 'DEBUG',
      message: 'Hello',
    } as any;
    const subscriber = jest.fn();

    client.debugTarget!.subscribe(subscriber);
    client.debugTarget!.dispatchEvent(event);

    expect(subscriber).toBeCalledTimes(1);
    expect(subscriber).toBeCalledWith(event);
  });
});
