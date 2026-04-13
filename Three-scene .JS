(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
    velocities.push({
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.003,
      z: (Math.random() - 0.5) * 0.002,
    });
    sizes[i] = Math.random() * 2 + 0.5;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0x6c63ff,
    size: 0.03,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const shapes = [];
  const shapeColors = [0x6c63ff, 0x00d4ff, 0x8b85ff, 0x4a47d1];

  function createShape(type, size, color) {
    let geo;
    if (type === 0) geo = new THREE.OctahedronGeometry(size);
    else if (type === 1) geo = new THREE.TetrahedronGeometry(size);
    else if (type === 2) geo = new THREE.IcosahedronGeometry(size, 0);
    else geo = new THREE.TorusGeometry(size, size * 0.3, 8, 12);

    const mat = new THREE.MeshBasicGeometry
      ? null
      : new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.15 });

    const wireMat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.15 });
    const mesh = new THREE.Mesh(geo, wireMat);

    mesh.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 5 - 2
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    const speed = {
      rx: (Math.random() - 0.5) * 0.008,
      ry: (Math.random() - 0.5) * 0.008,
      rz: (Math.random() - 0.5) * 0.004,
      tx: (Math.random() - 0.5) * 0.003,
      ty: (Math.random() - 0.5) * 0.003,
    };

    scene.add(mesh);
    shapes.push({ mesh, speed });
  }

  for (let i = 0; i < 18; i++) {
    createShape(i % 4, Math.random() * 0.4 + 0.15, shapeColors[i % shapeColors.length]);
  }

  const ringGeo = new THREE.TorusGeometry(2.5, 0.008, 8, 80);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x6c63ff, transparent: true, opacity: 0.2 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(3, 0, -2);
  scene.add(ring);

  const ring2Geo = new THREE.TorusGeometry(1.8, 0.005, 8, 60);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.15 });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.position.set(-3, 1, -3);
  ring2.rotation.x = Math.PI / 3;
  scene.add(ring2);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i].x;
      pos[i3 + 1] += velocities[i].y;
      pos[i3 + 2] += velocities[i].z;

      if (pos[i3] > 10 || pos[i3] < -10) velocities[i].x *= -1;
      if (pos[i3 + 1] > 10 || pos[i3 + 1] < -10) velocities[i].y *= -1;
      if (pos[i3 + 2] > 5 || pos[i3 + 2] < -5) velocities[i].z *= -1;
    }
    particleGeo.attributes.position.needsUpdate = true;

    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    shapes.forEach(({ mesh, speed }) => {
      mesh.rotation.x += speed.rx;
      mesh.rotation.y += speed.ry;
      mesh.rotation.z += speed.rz;
      mesh.position.x += speed.tx;
      mesh.position.y += speed.ty;

      if (mesh.position.x > 8 || mesh.position.x < -8) speed.tx *= -1;
      if (mesh.position.y > 8 || mesh.position.y < -8) speed.ty *= -1;
    });

    ring.rotation.y = frame * 0.004;
    ring.rotation.z = frame * 0.002;
    ring2.rotation.z = -frame * 0.003;
    ring2.rotation.y = frame * 0.005;

    camera.position.x += (mouseX - camera.position.x) * 0.03;
    camera.position.y += (-mouseY - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  const observer = new MutationObserver(() => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    particleMat.color.setHex(isLight ? 0x5046e5 : 0x6c63ff);
    particleMat.opacity = isLight ? 0.4 : 0.7;
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
