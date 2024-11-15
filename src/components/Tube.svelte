<script lang="ts">
  import * as THREE from "three";
  import { onMount } from "svelte";
  import type { TubeConfiguration } from "../types";

  export let tubeConfigurations: TubeConfiguration[];

  let container: HTMLDivElement;

  onMount(() => {
    // Create raycaster and mouse vector for detecting pointer events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 30); // Adjust camera position to see all tubes
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Load environment map from CubeTextureLoader
    const loader = new THREE.CubeTextureLoader();
    const environmentMap = loader.load(
      [
        "/textures/sunset_cube_map_2/px.png",
        "/textures/sunset_cube_map_2/nx.png",
        "/textures/sunset_cube_map_2/py.png",
        "/textures/sunset_cube_map_2/ny.png",
        "/textures/sunset_cube_map_2/pz.png",
        "/textures/sunset_cube_map_2/nz.png",
      ],
      () => {
        scene.environment = environmentMap;
        scene.background = environmentMap;
      },
      undefined,
      (error) => {
        console.error("Error loading environment map:", error);
        // Set a fallback plain background color
        scene.background = new THREE.Color(0x202020);
      }
    );
    environmentMap.mapping = THREE.CubeRefractionMapping;

    // Add lights to make tubes visible
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // soft ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Function to create a tube
    function createTube(
      length: number,
      position: { x: number; y: number; z: number },
      soundFile: string
    ): void {
      const geometry = new THREE.CylinderGeometry(1, 1, length, 64, 1, true);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.55,
        roughness: 0.05,
        transparent: true,
        opacity: 0.35,
        transmission: 1.0, // Makes the material appear clear
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 0.9,
        sheen: 0.6,
        sheenColor: new THREE.Color(0xffffff),
        envMap: environmentMap,
        envMapIntensity: 2.0, // Make the environment map more intense for visibility
        iridescence: 1.0, // Increase iridescence for stronger rainbow reflections
        iridescenceIOR: 1.3, // Index of refraction to enhance iridescence effect
        iridescenceThicknessRange: [300, 600], // Control thickness for rainbow reflections
      });
      const tube = new THREE.Mesh(geometry, material);
      tube.position.set(position.x, position.y, position.z);
      scene.add(tube);

      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      let lastPlayed = 0;
      tube.userData = {
        playSound: () => {
          console.log("Attempting to play sound:", soundFile);
          const now = Date.now();
          if (now - lastPlayed > 300) {
            // 300ms debounce to prevent rapid firing
            audio.pause();
            audio.currentTime = 0;
            audio.play().catch((error) => {
              console.error("Audio play failed:", error);
            });
            lastPlayed = now;
          }
        },
      };
    }

    // Create multiple tubes based on configuration
    for (const config of tubeConfigurations) {
      createTube(config.length, config.position, config.soundFile);
    }

    // Mouse event for interaction
    window.addEventListener("click", (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      intersects.forEach((intersect) => {
        if (intersect.object.userData.playSound) {
          intersect.object.userData.playSound();
        }
      });
    });

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup on unmount
    return () => {
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  });
</script>

<div bind:this={container} class="container"></div>

<style>
  .container {
    width: 100vw;
    height: 100vh;
  }
</style>
