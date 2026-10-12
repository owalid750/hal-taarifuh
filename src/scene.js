import * as THREE from 'three';

export class DesertScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.dunesMesh = null;
    this.particles = null;
    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.targetCameraZ = 30;
    this.targetCameraY = 12;
    this.targetRotationY = 0;
    this.themeState = 0; // 0: desert dawn, 1: mid day, 2: starry night
    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xd6a868, 0.015);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
    this.camera.position.set(0, 14, 32);
    this.camera.lookAt(0, 4, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.ambientLight = new THREE.AmbientLight(0xffecd2, 0.85);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffd59e, 1.8);
    this.sunLight.position.set(25, 40, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.scene.add(this.sunLight);

    // Subtle blue fill light for sky contrast
    this.skyFillLight = new THREE.DirectionalLight(0x7fb8d8, 0.45);
    this.skyFillLight.position.set(-20, 20, -15);
    this.scene.add(this.skyFillLight);

    // 5. Build Meshes
    this.createDesertDunes();
    this.createGlowingParticles();
    this.createCrescentMoon();

    // 6. Events
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });

    // 7. Render Loop
    this.animate();
  }

  createDesertDunes() {
    // Generate terrain with layered sine waves to mimic undulating golden dunes
    const width = 160;
    const height = 160;
    const segments = 90;
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    this.duneHeights = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Multi-frequency wave for desert ridges
      const d1 = Math.sin(x * 0.045 + 0.5) * Math.cos(z * 0.035) * 5.0;
      const d2 = Math.sin(x * 0.09 - z * 0.06) * 2.2;
      const d3 = Math.cos(x * 0.02 + z * 0.04) * 3.5;
      const valley = Math.exp(-((x * x + z * z) / 2500)) * -3.0; // subtle path in center

      const y = d1 + d2 + d3 + valley;
      pos.setY(i, y);
      this.duneHeights[i] = y;
    }
    geometry.computeVertexNormals();

    // Sand material with warm rough appearance
    const sandMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfab68,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: false,
    });

    this.dunesMesh = new THREE.Mesh(geometry, sandMaterial);
    this.dunesMesh.position.y = -2;
    this.dunesMesh.receiveShadow = true;
    this.scene.add(this.dunesMesh);
  }

  createGlowingParticles() {
    // 1200 floating golden sand motes / starlight particles
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 1] = Math.random() * 32 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 110;
      scales[i] = Math.random() * 2.5 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom circle particle texture created dynamically
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 240, 190, 1)');
    grad.addColorStop(0.3, 'rgba(224, 165, 80, 0.7)');
    grad.addColorStop(1, 'rgba(224, 165, 80, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.85,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffe29a,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createCrescentMoon() {
    // A stylized celestial crescent or golden ring in the distant horizon
    const group = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(7, 0.35, 16, 64, Math.PI * 1.3);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffecc4,
      transparent: true,
      opacity: 0.7,
    });
    const crescent = new THREE.Mesh(ringGeo, ringMat);
    crescent.rotation.z = Math.PI / 4;
    group.add(crescent);

    group.position.set(-35, 30, -60);
    this.crescentMoon = group;
    this.scene.add(this.crescentMoon);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 1.5;
      this.mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 1.5;
    }
  }

  setStationProgress(stationIndex, totalStations) {
    // Moves camera along an atmospheric path across the dunes
    const ratio = stationIndex / Math.max(1, totalStations - 1);

    // Dynamic camera coordinates based on journey progression
    this.targetCameraZ = 32 - ratio * 18;
    this.targetCameraY = 13 + Math.sin(ratio * Math.PI) * 4;
    this.targetRotationY = (ratio - 0.5) * 0.45;

    // Shift lighting / atmosphere from warm desert dawn to serene starry twilight in later stations
    if (stationIndex >= 5) {
      // Twilight / Serene Night for Wafaa & Virtues
      this.scene.fog.color.setHex(0x1a2634);
      this.ambientLight.color.setHex(0x425870);
      this.sunLight.color.setHex(0xd0e6ff);
      if (this.dunesMesh) this.dunesMesh.material.color.setHex(0x6b5a45);
      if (this.crescentMoon) this.crescentMoon.children[0].material.color.setHex(0xffffff);
    } else {
      // Golden Sahara Warmth
      this.scene.fog.color.setHex(0xd6a868);
      this.ambientLight.color.setHex(0xffecd2);
      this.sunLight.color.setHex(0xffd59e);
      if (this.dunesMesh) this.dunesMesh.material.color.setHex(0xdfab68);
      if (this.crescentMoon) this.crescentMoon.children[0].material.color.setHex(0xffecc4);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Camera motion
    this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.04;
    this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.04;
    this.camera.position.x = this.mouse.x * 2.5;
    this.camera.rotation.y = this.targetRotationY + this.mouse.x * -0.04;
    this.camera.rotation.x = -0.15 + this.mouse.y * -0.03;

    // Gentle floating particle drift
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(elapsed * 0.8 + positions[i]) * 0.015;
        positions[i] += Math.cos(elapsed * 0.4 + positions[i + 2]) * 0.01;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y = elapsed * 0.012;
    }

    // Crescent slow pulse
    if (this.crescentMoon) {
      this.crescentMoon.rotation.y = elapsed * 0.03;
      this.crescentMoon.position.y = 30 + Math.sin(elapsed * 0.5) * 1.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
