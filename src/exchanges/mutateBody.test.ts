import { makeFragmentsFromQuery } from './mutateBody';
import {
  introspectionFromSchema,
  buildClientSchema,
  buildSchema,
} from 'graphql';
import gql from 'graphql-tag';

const schemaDef = `
  type User {
    id: ID!
    name: String!
    age: Int!
  }

  type Todo {
    id: ID!
    text: String!
    creator: User!
  }

  type Query {
    todos: [Todo]
  }
`;

const query = gql`
  query {
    todos {
      id
      name
      creator {
        id
      }
    }
  }

  fragment TodoFragment on Todo {
    id
  }
`;

const data = {
  todos: [
    {
      id: '9',
      text: '1234',
      user: {
        name: '1234',
        __typename: 'User',
      },
      __typename: 'Todo',
    },
    {
      id: '10',
      __typename: 'Todo',
    },
  ],
};

const schema = introspectionFromSchema(buildSchema(schemaDef));

const response = {
  data,
  operation: {
    query,
  },
} as any;

describe('getFragmentsFromResponse', () => {
  it('creates fragments', () => {
    const r = makeFragmentsFromQuery(schema, query, { _fragments: [] });
    expect(r).toMatchInlineSnapshot(`
      Object {
        "Todo": Array [
          "{
        id
        name
        creator {
          id
        }
      }",
        ],
        "User": Array [
          "{
        id
      }",
        ],
        "_fragments": Array [
          "fragment TodoFragment on Todo {
        id
      }",
        ],
      }
    `);
  });
});
