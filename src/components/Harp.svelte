<script lang="ts">
  import * as THREE from "three";
  import { Howl } from "howler";
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

  function initializeScene(): THREE.Scene {
    const scene = new THREE.Scene();
    const loader = new THREE.CubeTextureLoader();
    const environmentMap = loader.load(
      CUBE_MAP,
      () => {
        scene.environment = environmentMap;
        scene.background = environmentMap;
        scene.fog = new THREE.Fog(new THREE.Color(0x202020), 150, 200);
      },
      undefined,
      (error) => {
        console.error("Error loading environment map:", error);
        scene.background = new THREE.Color(0x202020);
      }
    );
    environmentMap.mapping = THREE.CubeRefractionMapping;
    return scene;
  }

  function initializeCameraAndRenderer(container: HTMLDivElement): {
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
  } {
    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    return { camera, renderer };
  }

  function initializeLighting(scene: THREE.Scene): {
    ambientLight: THREE.AmbientLight;
    directionalLight: THREE.DirectionalLight;
  } {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(15, 20, 20);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    return { ambientLight, directionalLight };
  }

  function createTubes(
    scene: THREE.Scene,
    tubeConfigurations: TubeConfiguration[]
  ) {
    tubeConfigurations.forEach(({ length, position, soundFile }) => {
      createTube(length, position, soundFile, scene);
    });
  }

  function createTube(
    length: number,
    position: { x: number; y: number; z: number },
    soundFile: string,
    scene: THREE.Scene
  ): void {
    const loader = new THREE.CubeTextureLoader();
    const environmentMap = loader.load(CUBE_MAP);

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
      transmission: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.9,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffffff),
      envMap: environmentMap,
      envMapIntensity: 2.0,
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
      transmission: 0.5,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.5,
      envMap: environmentMap,
    });
    const innerTube = new THREE.Mesh(innerGeometry, innerMaterial);
    innerTube.position.set(position.x, position.y, position.z);
    scene.add(innerTube);

    const audio = new Howl({
      src: [soundFile],
      volume: 0.4,
      html5: true,
    });
    // Set the position of the sound in the 3D space
    audio.pos(position.x, position.y, position.z);

    // Add playSound functionality to userData
    outerTube.userData = {
      playSound: () => {
        audio.stop();
        audio.play();

        // Tube shrinking animation
        outerTube.scale.set(0.98, 0.98, 0.98);
        innerTube.scale.set(0.98, 0.98, 0.98);
        new TWEEN.Tween(outerTube.scale)
          .to({ x: 1, y: 1, z: 1 }, 600)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
        new TWEEN.Tween(innerTube.scale)
          .to({ x: 1, y: 1, z: 1 }, 600)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      },
    };
  }

  let currentlyHovered: THREE.Mesh | null = null;

  function handlePointerMove(scene: THREE.Scene, raycaster: THREE.Raycaster) {
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object as THREE.Mesh;
      if (currentlyHovered !== intersectedObject) {
        if (currentlyHovered) {
          (currentlyHovered.material as THREE.MeshPhysicalMaterial).emissive =
            new THREE.Color(0x000000);
        }
        (intersectedObject.material as THREE.MeshPhysicalMaterial).emissive =
          new THREE.Color(0xffcc00);
        currentlyHovered = intersectedObject;
      }
    } else if (currentlyHovered) {
      (currentlyHovered.material as THREE.MeshPhysicalMaterial).emissive =
        new THREE.Color(0x000000);
      currentlyHovered = null;
    }
  }

  function handlePointerClick(scene: THREE.Scene, raycaster: THREE.Raycaster) {
    const intersects = raycaster.intersectObjects(scene.children, true);
    intersects.forEach((intersect) => {
      if (intersect.object.userData.playSound) {
        intersect.object.userData.playSound();
      }
    });
  }

  onMount(() => {
    // Scene and camera setup
    const scene = initializeScene();
    const { camera, renderer } = initializeCameraAndRenderer(container);
    const { ambientLight, directionalLight } = initializeLighting(scene);

    // Raycaster and mouse vector for detecting pointer events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Tube creation
    createTubes(scene, tubeConfigurations);

    // Event handlers
    function handleMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      handlePointerMove(scene, raycaster);
    }

    function handleTouchMove(event: TouchEvent) {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        handlePointerMove(scene, raycaster);
      }
    }

    function handleClick(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      handlePointerClick(scene, raycaster);
    }

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        handlePointerClick(scene, raycaster);
      }
    }

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTouchStart);

    // Animation loop
    function animate() {
      TWEEN.update();
      const time = Date.now() * 0.0001;
      const hue = (time * 360) % 360;
      scene.fog = new THREE.Fog(
        new THREE.Color(`hsl(${hue}, 30%, 20%)`),
        150,
        300
      );
      directionalLight.intensity = 1 + Math.sin(Date.now() * 0.001) * 0.1;

      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup on unmount
    return () => {
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  });
</script>

<div bind:this={container} class="container"></div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
  }

  .container {
    width: 100%;
    height: 100vh;
    position: relative;
  }
</style>
