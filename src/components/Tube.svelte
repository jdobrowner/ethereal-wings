<script lang="ts">
  import type { Howl } from "howler";
  export let sound: Howl;
  export let index: number;

  function playSound() {
    if (sound.playing()) {
      sound.stop();
    }
    sound.play();
  }
</script>

<div
  class="tube"
  on:click={playSound}
  style={`height:${320 - index * 10}px`}
></div>

<style>
  .tube {
    width: 30px;
    cursor: pointer;
    background-color: #2795bb;
  }
</style>
