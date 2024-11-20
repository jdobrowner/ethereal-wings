<script lang="ts">
  import Harp from "./components/Harp.svelte";
  import type { TubeConfiguration } from "./types";
  import HarpConfigs from "./harpConfigs";

  const tubes: TubeConfiguration[] = HarpConfigs.HeartE;
</script>

<main>
  <h1>heart e</h1>
  <Harp tubeConfigurations={tubes} />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 100vh;
  }
</style>
