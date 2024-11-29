<script lang="ts">
  import Harp from "./components/Harp.svelte";
  import type { TubeConfiguration } from "./types";
  import HarpConfigs from "./harpConfigs";

  let tubes: TubeConfiguration[] = HarpConfigs.HeartE;
  let selectedModel = "heart-e";
  // let selectedModel = "secretive-f";
  $: {
    switch (selectedModel) {
      case "heart-e":
        tubes = HarpConfigs.HeartE;
        break;
      case "secretive-f":
        tubes = HarpConfigs.SecretiveF;
        break;
      default:
        break;
    }
  }
</script>

<main>
  <div class="model-selector">
    <h2
      class:selected={selectedModel === "heart-e"}
      on:click={() => (selectedModel = "heart-e")}
      on:touchstart={() => (selectedModel = "heart-e")}
    >
      HEART E
    </h2>
    <h2
      class:selected={selectedModel === "secretive-f"}
      on:click={() => (selectedModel = "secretive-f")}
      on:touchstart={() => (selectedModel = "secretive-f")}
    >
      SECRETIVE F
    </h2>
  </div>
  <Harp tubeConfigurations={tubes} {selectedModel} />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 100vh;
  }
  .model-selector {
    position: absolute;
    display: flex;
    padding: 40px;
    gap: 20px;
    z-index: 2;
    flex-direction: column;
    width: fit-content;
    left: 0;
    top: 0;
  }
  h2 {
    font-size: 20px;
    cursor: pointer;
    padding: 4px 16px;
    border: 2px solid transparent;
  }
  .selected {
    border: 2px solid #f0f6f5;
    border-radius: 16px;
  }
</style>
