<script lang="ts">
  import logo from "./assets/logo.png";
  import harp from "./assets/heart-harp.jpg";
  import { Howl } from "howler";
  import Tube from "./components/Tube.svelte";

  // Define audio files
  let audioFiles: string[] = [
    "audio/E5.m4a",
    "audio/E6.m4a",
    "audio/G5.m4a",
    "audio/A5.m4a",
    "audio/C6.m4a",
    "audio/D6.m4a",
  ];

  // Create a DynamicsCompressorNode
  // const compressor = Howler.ctx.createDynamicsCompressor();
  // compressor.threshold.setValueAtTime(-50, Howler.ctx.currentTime); // Adjust to control when compression kicks in
  // compressor.knee.setValueAtTime(60, Howler.ctx.currentTime); // Smoothing around the threshold
  // compressor.ratio.setValueAtTime(15, Howler.ctx.currentTime); // The amount of compression
  // compressor.attack.setValueAtTime(0, Howler.ctx.currentTime); // How quickly the compressor starts working
  // compressor.release.setValueAtTime(0.25, Howler.ctx.currentTime); // How quickly it stops compressing

  // Create Howler instances for each audio file
  let sounds = audioFiles.map((file) => new Howl({ src: [file], volume: 0.4 }));
  // compressor.connect(Howler.ctx.destination);
</script>

<main>
  <img src={logo} alt="Ethereal Wings" />
  <div class="harp-container">
    <!-- <img class="harp-img" src={harp} alt="Heart E" /> -->
    <!-- <img src={harpImage} alt="Crystal Harp" /> -->
    {#each sounds as sound, i}
      <Tube {sound} index={i} />
    {/each}
  </div>
</main>

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
    gap: 30px;
    align-items: center;
    padding-bottom: 15vh;
  }
  .harp-img {
  }
</style>
