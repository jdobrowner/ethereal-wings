<script lang="ts">
  import logo from "./assets/logo.png";
  import harp from "./assets/heart-harp.jpg";
  import Tube from "./components/Tube.svelte";
  import type { TubeConfiguration } from "./types";

  // Define audio files
  let audioFiles: string[] = [
    "audio/E5.m4a",
    "audio/E6.m4a",
    "audio/G5.m4a",
    "audio/A5.m4a",
    "audio/C6.m4a",
    "audio/D6.m4a",
  ];

  const tubes: TubeConfiguration[] = [
    {
      length: 18,
      position: { x: -10, y: 0, z: 0 },
      soundFile: "/audio/D6.m4a",
    },
    {
      length: 19,
      position: { x: -6, y: 0, z: 0 },
      soundFile: "/audio/C6.m4a",
    },
    { length: 20, position: { x: -2, y: 0, z: 0 }, soundFile: "/audio/A5.m4a" },
    { length: 21, position: { x: 2, y: 0, z: 0 }, soundFile: "/audio/G5.m4a" },
    { length: 22, position: { x: 6, y: 0, z: 0 }, soundFile: "/audio/E6.m4a" },
    { length: 23, position: { x: 10, y: 0, z: 0 }, soundFile: "/audio/E5.m4a" },
  ];
</script>

<!-- <main>
  <img src={logo} alt="Ethereal Wings" />
  <div class="harp-container">
    {#each sounds as sound, i}
      <Tube {sound} index={i} />
    {/each}
  </div>
</main> -->

<Tube tubeConfigurations={tubes} />

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 100vh;
  }
  .harp-container {
    position: relative;
    /* height: 800px; */
    display: flex;
    /* gap: 30px; */
    align-items: center;
    padding-bottom: 15vh;
  }
  .harp-img {
  }
</style>
