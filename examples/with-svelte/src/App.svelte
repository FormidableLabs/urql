<script>
  import { initClient } from "@urql/svelte";
  import PokemonList from "./PokemonList.svelte";

  initClient({
    url: "https://trygql.formidable.dev/graphql/basic-pokedex"
  });
</script>

<PokemonList />
