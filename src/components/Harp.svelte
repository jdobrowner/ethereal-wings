<script lang="ts">
  import * as THREE from "three";
  import { onMount } from "svelte";
  import TWEEN from "@tweenjs/tween.js";
  import type { TubeConfiguration } from "../types";

  export let tubeConfigurations: TubeConfiguration[];

  let container: HTMLDivElement;
  let CUBE_MAP = [
    "/textures/sunset_cube_map_2/px.png",
    "/textures/sunset_cube_map_2/nx.png",
    "/textures/sunset_cube_map_2/py.png",
    "/textures/sunset_cube_map_2/ny.png",
    "/textures/sunset_cube_map_2/pz.png",
    "/textures/sunset_cube_map_2/nz.png",
  ];

  onMount(() => {
    // Create raycaster and mouse vector for detecting pointer events
    let currentlyHovered: THREE.Mesh | null = null;
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
      CUBE_MAP,
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // soft ambient light, slightly increased
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(15, 20, 20); // Adjusted to give better overall lighting
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add spotlight for each tube to highlight it
    tubeConfigurations.forEach(({ position }) => {
      const spotlight = new THREE.SpotLight(0xffffff, 1.2);
      spotlight.position.set(position.x + 5, position.y + 10, position.z + 5);
      spotlight.target.position.set(position.x, position.y, position.z);
      scene.add(spotlight);
      scene.add(spotlight.target);
    });

    // Function to create a tube
    function createTube(
      length: number,
      position: { x: number; y: number; z: number },
      soundFile: string
    ): void {
      // Outer tube geometry and material
      const outerGeometry = new THREE.CylinderGeometry(
        1.1,
        1.1,
        length,
        64,
        1,
        true
      );
      const outerMaterial = new THREE.MeshPhysicalMaterial({
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
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0.2,
      });
      const outerTube = new THREE.Mesh(outerGeometry, outerMaterial);
      outerTube.position.set(position.x, position.y, position.z);
      scene.add(outerTube);

      // Inner tube geometry and material
      const innerGeometry = new THREE.CylinderGeometry(
        0.9,
        0.9,
        length,
        64,
        1,
        true
      );
      const innerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8,
        transmission: 0.5, // Makes the inner part less transparent
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.5,
      });
      const innerTube = new THREE.Mesh(innerGeometry, innerMaterial);
      innerTube.position.set(position.x, position.y, position.z);
      scene.add(innerTube);

      // Audio setup for the tube
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      let lastPlayed = 0;
      outerTube.userData = {
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
            // Animate tube shrinking effect
            outerTube.scale.set(0.985, 0.985, 0.985);
            innerTube.scale.set(0.985, 0.985, 0.985);
            // Smoothly animate return to normal size
            new TWEEN.Tween(outerTube.scale)
              .to({ x: 1, y: 1, z: 1 }, 600)
              .easing(TWEEN.Easing.Quadratic.Out)
              .start();
            new TWEEN.Tween(innerTube.scale)
              .to({ x: 1, y: 1, z: 1 }, 600)
              .easing(TWEEN.Easing.Quadratic.Out)
              .start();
          }
        },
      };
    }

    // Create multiple tubes based on configuration
    tubeConfigurations.forEach(({ length, position, soundFile }) => {
      createTube(length, position, soundFile);
    });

    // Mouse event for interaction
    window.addEventListener("mousemove", (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object as THREE.Mesh;
        if (currentlyHovered !== intersectedObject) {
          if (currentlyHovered) {
            // Reset previous hovered material
            (currentlyHovered.material as THREE.MeshPhysicalMaterial).emissive =
              new THREE.Color(0x000000);
          }
          // Set new hovered material
          (intersectedObject.material as THREE.MeshPhysicalMaterial).emissive =
            new THREE.Color(0xffcc00);
          currentlyHovered = intersectedObject;
        }
      } else {
        if (currentlyHovered) {
          // Reset material if no longer hovered
          (currentlyHovered.material as THREE.MeshPhysicalMaterial).emissive =
            new THREE.Color(0x000000);
          currentlyHovered = null;
        }
      }
    });
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
      TWEEN.update();
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
