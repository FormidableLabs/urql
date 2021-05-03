import { initUrqlClient } from "next-urql";
import Link from 'next/link';
import {
  ssrExchange,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  useQuery,
  gql
} from "urql";

const POKEMONS_QUERY = gql`
  query {
    pokemons(limit: 10) {
      id
      name
    }
  }
`;

function Static() {
  const [res] = useQuery({ query: POKEMONS_QUERY });

  return (
    <div>
      <h1>Static</h1>
      {res.data.pokemons.map((pokemon) => (
        <div key={pokemon.id}>
          {pokemon.id} - {pokemon.name}
        </div>
      ))}
      <Link href="/static-2">Static 2</Link>
    </div>
  );
}

export async function getStaticProps() {
  const ssrCache = ssrExchange({ isClient: false });
  const client = initUrqlClient({
    url: "https://trygql.dev/graphql/basic-pokedex",
    exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange]
  }, false);

  // This query is used to populate the cache for the query
  // used on this page.
  await client.query(POKEMONS_QUERY).toPromise();

  return {
    props: {
      // urqlState is a keyword here so withUrqlClient can pick it up.
      urqlState: ssrCache.extractData()
    },
  };
}

export default Static;
