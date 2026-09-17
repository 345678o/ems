"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface DroneModelProps {
  className?: string;
  style?: React.CSSProperties;
  onLoaded?: () => void;
}

export function DroneModel({ className = "", style, onLoaded }: DroneModelProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [, setLoading] = useState(true);
  const [, setLoadPercent] = useState(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    // Fill the container absolutely
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xfffbf5, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffecd6, 1.4);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    // Warm orange and electric purple subtle accent lights
    const orangeGlow = new THREE.PointLight(0xfb5607, 1.6, 6);
    orangeGlow.position.set(2, -1, 1.5);
    scene.add(orangeGlow);

    const purpleGlow = new THREE.PointLight(0x8338ec, 1.4, 6);
    purpleGlow.position.set(-2, 1.5, 1.5);
    scene.add(purpleGlow);

    // --- Soft Contact Shadow Texture ---
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(33, 37, 41, 0.28)");
      grad.addColorStop(0.4, "rgba(33, 37, 41, 0.12)");
      grad.addColorStop(1, "rgba(33, 37, 41, 0)");
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.2, 2.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.9, 0);
    scene.add(shadowMesh);

    // --- Drone Groups: Shifted Left at Same Height ---
    const masterGroup = new THREE.Group();
    masterGroup.position.set(-0.95, 0.28, 0);
    scene.add(masterGroup);

    const dronePivot = new THREE.Group();
    masterGroup.add(dronePivot);

    let mixer: THREE.AnimationMixer | null = null;
    let loadedModel: THREE.Group | null = null;

    // --- GLTF Loader ---
    const loader = new GLTFLoader();
    loader.load(
      "/ems/comic_drone.glb",
      (gltf) => {
        const model = gltf.scene;
        loadedModel = model;

        // Auto-center model at its bounding box center
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Larger, prominent size that fills the center comfortably
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetSize = 2.25;
        const scaleFactor = targetSize / maxDim;
        dronePivot.scale.set(scaleFactor, scaleFactor, scaleFactor);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        dronePivot.add(model);

        // Fixed facing forward directly toward user
        dronePivot.rotation.y = 0;
        dronePivot.rotation.x = 0.14;

        // Play all animation clips (propellers, drone action)
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            const action = mixer!.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
          });
        }

        setLoading(false);
        onLoaded?.();
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadPercent(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.error("Failed to load drone model:", err);
        setLoading(false);
        onLoaded?.();
      }
    );

    // --- Resize Observer ---
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      masterGroup.position.x = -0.95;
    });
    resizeObserver.observe(container);

    // --- Animation Loop: Pure Autonomous Animation ---
    let animId: number;
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Play the drone's 3D animation (spinning rotors & flight motion)
      if (mixer) {
        mixer.update(delta);
      }

      // Fixed facing forward position — no user rotation or displacement
      dronePivot.rotation.y = 0;
      dronePivot.rotation.x = 0.14;
      dronePivot.rotation.z = 0;

      // Contact shadow locked directly under the drone
      if (loadedModel) {
        const droneWorldPos = new THREE.Vector3();
        loadedModel.getWorldPosition(droneWorldPos);
        shadowMesh.position.x = droneWorldPos.x;
        shadowMesh.position.z = droneWorldPos.z;
        shadowMesh.position.y = droneWorldPos.y - 0.9;
      }

      renderer.render(scene, camera);
    }

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      renderer.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full select-none pointer-events-none ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        cursor: "default",
        ...style,
      }}
    />
  );
}
