import * as THREE from "three";
import type { TubeConfiguration } from "./types";
 import TWEEN from "@tweenjs/tween.js";

export const CUBE_MAP = [
    "/textures/sunset_cube_map_2/px.png",
    "/textures/sunset_cube_map_2/nx.png",
    "/textures/sunset_cube_map_2/py.png",
    "/textures/sunset_cube_map_2/ny.png",
    "/textures/sunset_cube_map_2/pz.png",
    "/textures/sunset_cube_map_2/nz.png",
  ];

 export function initializeCameraAndRenderer(container: HTMLDivElement): {
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

export function initializeLighting(scene: THREE.Scene): {
    ambientLight: THREE.AmbientLight;
    directionalLight: THREE.DirectionalLight;
  } {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Increase intensity to make tubes more visible
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increase intensity
    directionalLight.position.set(15, 20, 20);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    return { ambientLight, directionalLight };
  }

  export function initializeInteractions(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    raycaster: THREE.Raycaster,
    mouse: THREE.Vector2
  ) {
    let currentlyHovered: THREE.Mesh | null = null;

    window.addEventListener("mousemove", (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object as THREE.Mesh;
        if (currentlyHovered !== intersectedObject) {
          if (currentlyHovered) {
            // Reset the previous hovered material
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
      const intersects = raycaster.intersectObjects(scene.children, true);

      intersects.forEach((intersect) => {
        if (intersect.object.userData.playSound) {
          intersect.object.userData.playSound();
        }
      });
    });
  }

  export function createTubes(
    scene: THREE.Scene,
    environmentMap: THREE.CubeTexture,
    tubeConfigurations: TubeConfiguration[]
  ) {
    tubeConfigurations.forEach(({ length, position, soundFile }) => {
      createTube(length, position, soundFile, scene, environmentMap);
    });
  }

  function createTube(
    length: number,
    position: { x: number; y: number; z: number },
    soundFile: string,
    scene: THREE.Scene,
    environmentMap: THREE.CubeTexture
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
      transmission: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.9,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffffff),
      envMap: environmentMap, // Ensure envMap is assigned
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
      envMap: environmentMap, // Ensure envMap is assigned
    });
    const innerTube = new THREE.Mesh(innerGeometry, innerMaterial);
    innerTube.position.set(position.x, position.y, position.z);
    scene.add(innerTube);

    const audio = new Howl({
      src: [soundFile],
      volume: 0.5,
      html5: true,
    });

    // Add playSound functionality to userData
    outerTube.userData = {
      playSound: () => {
        console.log("Attempting to play sound:", soundFile);
        audio.stop();
        audio.play();

        // Tube shrinking animation
        outerTube.scale.set(0.98, 0.98, 0.98);
        innerTube.scale.set(0.98, 0.98, 0.98);
        new Tween.Tween(outerTube.scale)
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