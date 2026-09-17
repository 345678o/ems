"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import * as THREE from "three";

const TUNNEL_WIDTH = 5;
const TUNNEL_HEIGHT = 3.5;
const SEGMENT_DEPTH = 1;
const NUM_SEGMENTS = 15;
const LINE_RADIUS = 0.003;
const SCROLL_TO_Z = 0.05;
const CAMERA_CHASE = 0.1;
const FADE_IN = 1;
const FOG_FAR = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;

interface GalleryTunnelProps {
  images: string[];
  colors?: string[];
  background?: string;
  lineColor?: string;
  lineOpacity?: number;
  grid?: number;
  speed?: number;
  boost?: number;
  fade?: number;
  style?: CSSProperties;
}

export function GalleryTunnel({
  images,
  colors = ["#8338EC", "#FB5607", "#212529", "#E9ECEF"],
  background = "#8338EC",
  lineColor = "#ffffff",
  lineOpacity = 30,
  grid = 3,
  speed = 60,
  boost = 120,
  fade = 80,
  style,
}: GalleryTunnelProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const urls = useMemo(() => images.filter(Boolean), [images]);
  const palette = useMemo(() => colors.filter(Boolean), [colors]);

  const cfgRef = useRef({ speed: 1, boost: 1 });
  cfgRef.current = { speed: Math.max(0, speed) / 100, boost: Math.max(0, boost) / 10 };

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    const fogNear = Math.min(
      FOG_FAR * (1 - Math.min(100, Math.max(0, fade)) / 100),
      FOG_FAR - 0.01
    );
    scene.fog = new THREE.Fog(new THREE.Color(background), fogNear, FOG_FAR);

    const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);
    camera.position.set(0, 0, 0.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const lineMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(lineColor),
      transparent: true,
      opacity: Math.min(100, Math.max(0, lineOpacity)) / 100,
    });

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const fading: THREE.MeshBasicMaterial[] = [];
    let imageIndex = 0;
    let scrollPos = 0,
      raf = 0,
      last = 0,
      alive = true;

    const hw = TUNNEL_WIDTH / 2,
      hh = TUNNEL_HEIGHT / 2;
    const cols = Math.max(1, Math.round(grid));
    const rows = Math.max(1, Math.round(grid));
    const colW = TUNNEL_WIDTH / cols;
    const rowH = TUNNEL_HEIGHT / rows;

    const geoFloor = new THREE.PlaneGeometry(colW, SEGMENT_DEPTH);
    const geoWall = new THREE.PlaneGeometry(SEGMENT_DEPTH, rowH);
    const geoTubeZ = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -SEGMENT_DEPTH)),
      1,
      LINE_RADIUS,
      8
    );
    const geoTubeX = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(TUNNEL_WIDTH, 0, 0)),
      1,
      LINE_RADIUS,
      8
    );
    const geoTubeY = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, TUNNEL_HEIGHT, 0)),
      1,
      LINE_RADIUS,
      8
    );

    const colorMats = palette.map(
      (hex) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), side: THREE.DoubleSide })
    );

    const imageMats = urls.map((url) => {
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
      loader.load(url, (tex) => {
        if (!alive) {
          tex.dispose();
          return;
        }
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        mat.map = tex;
        mat.needsUpdate = true;
        fading.push(mat);
      });
      return mat;
    });

    const tube = (geo: THREE.BufferGeometry, x: number, y: number, z = 0) => {
      const m = new THREE.Mesh(geo, lineMat);
      m.position.set(x, y, z);
      return m;
    };

    const SLOTS: Array<{ geo: THREE.BufferGeometry; pos: THREE.Vector3; rot: THREE.Euler }> = [];
    const z = -SEGMENT_DEPTH / 2;
    for (let i = 0; i < cols; i++) {
      const x = -hw + i * colW + colW / 2;
      SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x, -hh, z), rot: new THREE.Euler(-Math.PI / 2, 0, 0) });
      SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x, hh, z), rot: new THREE.Euler(Math.PI / 2, 0, 0) });
    }
    for (let i = 0; i < rows; i++) {
      const y = -hh + i * rowH + rowH / 2;
      SLOTS.push({ geo: geoWall, pos: new THREE.Vector3(-hw, y, z), rot: new THREE.Euler(0, Math.PI / 2, 0) });
      SLOTS.push({ geo: geoWall, pos: new THREE.Vector3(hw, y, z), rot: new THREE.Euler(0, -Math.PI / 2, 0) });
    }

    function populate(group: THREE.Group) {
      const slabs = group.userData.slabs as THREE.Mesh[];
      for (const slab of slabs) {
        // ~30% chance of being a black box, 70% image
        if (Math.random() < 0.3) {
          slab.visible = true;
          slab.material = colorMats[0]; // black/charcoal
        } else if (imageMats.length) {
          slab.visible = true;
          slab.material = imageMats[imageIndex % imageMats.length];
          imageIndex++;
        } else {
          slab.visible = false;
        }
      }
    }

    function createSegment(segZ: number) {
      const group = new THREE.Group();
      group.position.z = segZ;
      for (let i = 0; i <= cols; i++) {
        const x = -hw + i * colW;
        group.add(tube(geoTubeZ, x, -hh));
        group.add(tube(geoTubeZ, x, hh));
      }
      for (let i = 1; i < rows; i++) {
        const y = -hh + i * rowH;
        group.add(tube(geoTubeZ, -hw, y));
        group.add(tube(geoTubeZ, hw, y));
      }
      group.add(tube(geoTubeX, -hw, -hh));
      group.add(tube(geoTubeX, -hw, hh));
      group.add(tube(geoTubeY, -hw, -hh));
      group.add(tube(geoTubeY, hw, -hh));
      const slabs: THREE.Mesh[] = SLOTS.map((slot) => {
        const m = new THREE.Mesh(slot.geo, colorMats[0]);
        m.position.copy(slot.pos);
        m.rotation.copy(slot.rot);
        m.visible = false;
        group.add(m);
        return m;
      });
      group.userData.slabs = slabs;
      populate(group);
      return group;
    }

    const segments: THREE.Group[] = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const g = createSegment(-i * SEGMENT_DEPTH);
      scene.add(g);
      segments.push(g);
    }

    const resize = () => {
      const w = Math.max(1, frame.clientWidth),
        h = Math.max(1, frame.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(frame);
    resize();

    const animate = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(animate);
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const cfg = cfgRef.current;
      scrollPos += cfg.speed;
      camera.position.z += CAMERA_CHASE * (-SCROLL_TO_Z * scrollPos - camera.position.z);
      const span = NUM_SEGMENTS * SEGMENT_DEPTH;
      const cz = camera.position.z;
      for (const seg of segments) {
        if (seg.position.z > cz + SEGMENT_DEPTH) {
          let min = 0;
          for (const s of segments) min = Math.min(min, s.position.z);
          seg.position.z = min - SEGMENT_DEPTH;
          populate(seg);
        } else if (seg.position.z < cz - span - SEGMENT_DEPTH) {
          let max = -999999;
          for (const s of segments) max = Math.max(max, s.position.z);
          seg.position.z = max + SEGMENT_DEPTH;
          populate(seg);
        }
      }
      for (let i = fading.length - 1; i >= 0; i--) {
        const m = fading[i];
        m.opacity = Math.min(1, m.opacity + dt / FADE_IN);
        if (m.opacity >= 1) fading.splice(i, 1);
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      geoFloor.dispose();
      geoWall.dispose();
      geoTubeZ.dispose();
      geoTubeX.dispose();
      geoTubeY.dispose();
      for (const m of colorMats) m.dispose();
      for (const m of imageMats) {
        m.map?.dispose();
        m.dispose();
      }
      lineMat.dispose();
      renderer.dispose();
    };
  }, [urls, palette, background, lineColor, lineOpacity, grid, fade]);

  return (
    <div ref={frameRef} style={{ position: "absolute", inset: 0, ...style }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
