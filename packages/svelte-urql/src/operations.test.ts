import { makeSubject } from 'wonka';
import { createClient } from '@urql/core';
import { operationStore } from './operationStore';
import { query, subscription } from './operations';

const client = createClient({ url: '/graphql' });

jest.mock('./context', () => ({ getClient: () => client }));
jest.mock('svelte', () => ({ onDestroy: () => undefined }));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('query', () => {
  it('susbcribes to a query and updates data', () => {
    const subscriber = jest.fn();
    const subject = makeSubject<any>();
    const executeQuery = jest
      .spyOn(client, 'executeQuery')
      .mockImplementation(() => subject.source);

    const store = operationStore('{ test }');
    store.subscribe(subscriber);

    query(store);

    expect(executeQuery).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: expect.any(Object),
        variables: {},
      },
      undefined
    );

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(store.fetching).toBe(true);

    subject.next({ data: { test: true } });
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(store.data).toEqual({ test: true });

    subject.complete();
    expect(subscriber).toHaveBeenCalledTimes(4);
    expect(store.fetching).toBe(false);
  });

  it('updates the executed query when inputs change', () => {
    const subscriber = jest.fn();
    const subject = makeSubject<any>();
    const executeQuery = jest
      .spyOn(client, 'executeQuery')
      .mockImplementation(() => subject.source);

    const store = operationStore('{ test }');
    store.subscribe(subscriber);

    query(store);

    expect(executeQuery).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: expect.any(Object),
        variables: {},
      },
      undefined
    );

    subject.next({ data: { test: true } });
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(store.data).toEqual({ test: true });

    store.variables = { test: true };
    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(executeQuery).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: expect.any(Object),
        variables: { test: true },
      },
      undefined
    );

    expect(subscriber).toHaveBeenCalledTimes(5);
    expect(store.fetching).toBe(true);
    expect(store.data).toEqual({ test: true });
  });
});

describe('subscription', () => {
  it('susbcribes to a subscription and updates data', () => {
    const subscriber = jest.fn();
    const subject = makeSubject<any>();
    const executeQuery = jest
      .spyOn(client, 'executeSubscription')
      .mockImplementation(() => subject.source);

    const store = operationStore('subscription { test }');
    store.subscribe(subscriber);

    subscription(store);

    expect(executeQuery).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: expect.any(Object),
        variables: {},
      },
      undefined
    );

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(store.fetching).toBe(true);

    subject.next({ data: { test: true } });
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(store.data).toEqual({ test: true });

    subject.complete();
    expect(subscriber).toHaveBeenCalledTimes(4);
    expect(store.fetching).toBe(false);
  });

  it('updates the executed subscription when inputs change', () => {
    const subscriber = jest.fn();
    const subject = makeSubject<any>();
    const executeSubscription = jest
      .spyOn(client, 'executeSubscription')
      .mockImplementation(() => subject.source);

    const store = operationStore('{ test }');
    store.subscribe(subscriber);

    subscription(store);

    expect(executeSubscription).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: expect.any(Object),
        variables: {},
      },
      undefined
    );

    subject.next({ data: { test: true } });
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(store.data).toEqual({ test: true });

    store.variables = { test: true };
    expect(executeSubscription).toHaveBeenCalledTimes(2);
    expect(executeSubscription).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: expect.any(Object),
        variables: { test: true },
      },
      undefined
    );

    expect(subscriber).toHaveBeenCalledTimes(5);
    expect(store.fetching).toBe(true);
    expect(store.data).toEqual({ test: true });
  });

  it('supports a custom scanning handler', () => {
    const subscriber = jest.fn();
    const subject = makeSubject<any>();
    const executeSubscription = jest
      .spyOn(client, 'executeSubscription')
      .mockImplementation(() => subject.source);

    const store = operationStore('{ counter }');
    store.subscribe(subscriber);

    subscription(store, (prev, current) => ({
      counter: (prev ? prev.counter : 0) + current.counter,
    }));

    expect(executeSubscription).toHaveBeenCalledWith(
      {
        key: expect.any(Number),
        query: expect.any(Object),
        variables: {},
      },
      undefined
    );

    subject.next({ data: { counter: 1 } });
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(store.data).toEqual({ counter: 1 });

    subject.next({ data: { counter: 2 } });
    expect(subscriber).toHaveBeenCalledTimes(4);
    expect(store.data).toEqual({ counter: 3 });
  });
});
