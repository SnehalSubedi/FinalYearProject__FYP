import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function PlantScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // ── Scene ──
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x1a472a, 0.035)

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 3, 8)
    camera.lookAt(0, 2.5, 0)

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0x3a7d44, 0.6)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xfff4e0, 1.8)
    mainLight.position.set(5, 10, 5)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.set(1024, 1024)
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 30
    mainLight.shadow.camera.left = -10
    mainLight.shadow.camera.right = 10
    mainLight.shadow.camera.top = 10
    mainLight.shadow.camera.bottom = -10
    scene.add(mainLight)

    const backLight = new THREE.DirectionalLight(0x88ccaa, 0.5)
    backLight.position.set(-3, 5, -5)
    scene.add(backLight)

    const rimLight = new THREE.PointLight(0xaaffcc, 0.8, 15)
    rimLight.position.set(-4, 4, 2)
    scene.add(rimLight)

    // Subtle green hemisphere light for atmosphere
    const hemiLight = new THREE.HemisphereLight(0x88cc88, 0x2d5a27, 0.4)
    scene.add(hemiLight)

    // ── Materials ──
    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d6b35,
      roughness: 0.7,
      metalness: 0.05,
    })

    const leafMaterialTop = new THREE.MeshStandardMaterial({
      color: 0x4a9e3f,
      roughness: 0.5,
      metalness: 0.02,
      side: THREE.DoubleSide,
    })

    const leafMaterialDark = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.6,
      metalness: 0.02,
      side: THREE.DoubleSide,
    })

    const leafMaterialLight = new THREE.MeshStandardMaterial({
      color: 0x66bb6a,
      roughness: 0.45,
      metalness: 0.02,
      side: THREE.DoubleSide,
    })

    const leafMaterials = [leafMaterialTop, leafMaterialDark, leafMaterialLight]

    // ── Ground ──
    const groundGeo = new THREE.CircleGeometry(12, 64)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2a5a1e,
      roughness: 0.95,
      metalness: 0.0,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.05
    ground.receiveShadow = true
    scene.add(ground)

    // Soil mound
    const soilGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 1.0,
      metalness: 0.0,
    })
    const soil = new THREE.Mesh(soilGeo, soilMat)
    soil.position.y = 0
    soil.scale.set(1, 0.35, 1)
    soil.receiveShadow = true
    scene.add(soil)

    // ── Helper: Create leaf shape ──
    function createLeafShape() {
      const shape = new THREE.Shape()
      shape.moveTo(0, 0)
      shape.bezierCurveTo(0.15, 0.2, 0.35, 0.45, 0.15, 0.8)
      shape.bezierCurveTo(0.08, 0.95, 0, 1.0, 0, 1.0)
      shape.bezierCurveTo(0, 1.0, -0.08, 0.95, -0.15, 0.8)
      shape.bezierCurveTo(-0.35, 0.45, -0.15, 0.2, 0, 0)
      return shape
    }

    // ── Helper: Create a leaf mesh ──
    function createLeaf(scale = 1) {
      const shape = createLeafShape()
      const geometry = new THREE.ShapeGeometry(shape, 12)

      // Add slight curve to leaf
      const positions = geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i)
        const x = positions.getX(i)
        positions.setZ(i, Math.sin(y * Math.PI) * 0.08 * Math.abs(x) * 5)
      }
      geometry.computeVertexNormals()

      const mat = leafMaterials[Math.floor(Math.random() * leafMaterials.length)]
      const leaf = new THREE.Mesh(geometry, mat)
      leaf.scale.setScalar(scale)
      leaf.castShadow = true
      return leaf
    }

    // ── Helper: Create stem with CatmullRom ──
    function createStem(points, radius = 0.06) {
      const curve = new THREE.CatmullRomCurve3(points)
      const geo = new THREE.TubeGeometry(curve, 20, radius, 8, false)
      const mesh = new THREE.Mesh(geo, stemMaterial)
      mesh.castShadow = true
      return mesh
    }

    // ── Plant group (animated) ──
    const plantGroup = new THREE.Group()
    scene.add(plantGroup)

    // Main stem
    const mainStemPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, 0.8, 0.02),
      new THREE.Vector3(-0.03, 1.6, -0.02),
      new THREE.Vector3(0.08, 2.4, 0.03),
      new THREE.Vector3(0, 3.2, 0),
      new THREE.Vector3(-0.05, 4.0, -0.02),
      new THREE.Vector3(0.02, 4.6, 0.01),
    ]
    plantGroup.add(createStem(mainStemPoints, 0.08))

    // Animated leaves array
    const leaves = []

    // Leaves along main stem
    const leafConfigs = [
      { y: 0.8, rotZ: 0.5, rotY: 0, scale: 0.7 },
      { y: 0.8, rotZ: -0.6, rotY: Math.PI, scale: 0.65 },
      { y: 1.4, rotZ: 0.4, rotY: 0.8, scale: 0.85 },
      { y: 1.4, rotZ: -0.5, rotY: -0.7, scale: 0.8 },
      { y: 2.0, rotZ: 0.55, rotY: 1.6, scale: 0.95 },
      { y: 2.0, rotZ: -0.4, rotY: -1.5, scale: 0.9 },
      { y: 2.6, rotZ: 0.3, rotY: 0.4, scale: 1.0 },
      { y: 2.6, rotZ: -0.5, rotY: 2.4, scale: 0.95 },
      { y: 3.2, rotZ: 0.45, rotY: -0.3, scale: 1.1 },
      { y: 3.2, rotZ: -0.35, rotY: 2.8, scale: 1.05 },
      { y: 3.8, rotZ: 0.35, rotY: 1.2, scale: 1.0 },
      { y: 3.8, rotZ: -0.45, rotY: -1.0, scale: 0.95 },
      { y: 4.2, rotZ: 0.25, rotY: 0.6, scale: 0.85 },
      { y: 4.2, rotZ: -0.3, rotY: -0.5, scale: 0.8 },
    ]

    leafConfigs.forEach((cfg) => {
      const leaf = createLeaf(cfg.scale)
      leaf.position.set(0, cfg.y, 0)
      leaf.rotation.set(0, cfg.rotY, cfg.rotZ)

      // Small branch connecting leaf to stem
      const branchDir = new THREE.Vector3(
        Math.sin(cfg.rotY) * 0.3,
        0.15,
        Math.cos(cfg.rotY) * 0.3
      )
      const branchPoints = [
        new THREE.Vector3(0, cfg.y - 0.1, 0),
        new THREE.Vector3(branchDir.x * 0.5, cfg.y + branchDir.y * 0.5, branchDir.z * 0.5),
        new THREE.Vector3(branchDir.x, cfg.y + branchDir.y, branchDir.z),
      ]
      plantGroup.add(createStem(branchPoints, 0.025))

      leaf.position.set(branchDir.x, cfg.y + branchDir.y, branchDir.z)
      plantGroup.add(leaf)
      leaves.push({
        mesh: leaf,
        baseRotZ: cfg.rotZ,
        baseRotX: leaf.rotation.x,
        speed: 0.5 + Math.random() * 1.5,
        amplitude: 0.03 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      })
    })

    // ── Second smaller plant ──
    const plant2 = new THREE.Group()
    plant2.position.set(-1.5, 0, 1)
    plant2.scale.setScalar(0.55)
    scene.add(plant2)

    const stem2Points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, 0.7, 0.05),
      new THREE.Vector3(-0.05, 1.5, -0.03),
      new THREE.Vector3(0.03, 2.3, 0.02),
      new THREE.Vector3(0, 3.0, 0),
    ]
    plant2.add(createStem(stem2Points, 0.07))

    for (let i = 0; i < 8; i++) {
      const y = 0.6 + i * 0.35
      const angle = i * 1.3
      const leaf = createLeaf(0.6 + Math.random() * 0.4)
      const dx = Math.sin(angle) * 0.35
      const dz = Math.cos(angle) * 0.35
      leaf.position.set(dx, y + 0.1, dz)
      leaf.rotation.set(0, angle, (i % 2 === 0 ? 1 : -1) * 0.4)
      plant2.add(leaf)
      leaves.push({
        mesh: leaf,
        baseRotZ: leaf.rotation.z,
        baseRotX: leaf.rotation.x,
        speed: 0.6 + Math.random() * 1.2,
        amplitude: 0.04 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
      })
    }

    // ── Third plant (right side) ──
    const plant3 = new THREE.Group()
    plant3.position.set(1.8, 0, 0.5)
    plant3.scale.setScalar(0.45)
    scene.add(plant3)

    const stem3Points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.08, 0.6, 0.04),
      new THREE.Vector3(0.05, 1.3, -0.02),
      new THREE.Vector3(0, 2.0, 0),
      new THREE.Vector3(-0.03, 2.6, 0.01),
    ]
    plant3.add(createStem(stem3Points, 0.065))

    for (let i = 0; i < 6; i++) {
      const y = 0.5 + i * 0.38
      const angle = i * 1.6 + 0.5
      const leaf = createLeaf(0.5 + Math.random() * 0.35)
      const dx = Math.sin(angle) * 0.3
      const dz = Math.cos(angle) * 0.3
      leaf.position.set(dx, y + 0.1, dz)
      leaf.rotation.set(0, angle, (i % 2 === 0 ? 1 : -1) * 0.45)
      plant3.add(leaf)
      leaves.push({
        mesh: leaf,
        baseRotZ: leaf.rotation.z,
        baseRotX: leaf.rotation.x,
        speed: 0.5 + Math.random() * 1.3,
        amplitude: 0.03 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
      })
    }

    // ── Small grass tufts ──
    function createGrassBlade(height, x, z) {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.02, height * 0.4, 0.01),
        new THREE.Vector3(-0.01, height * 0.7, 0.02),
        new THREE.Vector3(0.03, height, -0.01),
      ]
      const curve = new THREE.CatmullRomCurve3(points)
      const geo = new THREE.TubeGeometry(curve, 8, 0.012, 4, false)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.28 + Math.random() * 0.08, 0.6, 0.25 + Math.random() * 0.15),
        roughness: 0.8,
      })
      const blade = new THREE.Mesh(geo, mat)
      blade.position.set(x, 0, z)
      blade.rotation.y = Math.random() * Math.PI * 2
      return blade
    }

    const grassGroup = new THREE.Group()
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 1.5 + Math.random() * 4
      const x = Math.cos(angle) * dist
      const z = Math.sin(angle) * dist
      const h = 0.15 + Math.random() * 0.35
      grassGroup.add(createGrassBlade(h, x, z))
    }
    scene.add(grassGroup)

    // ── Floating particles (pollen / fireflies) ──
    const particleCount = 80
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = new Float32Array(particleCount)
    const particlePhases = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10
      particlePositions[i * 3 + 1] = Math.random() * 7
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10
      particleSpeeds[i] = 0.2 + Math.random() * 0.6
      particlePhases[i] = Math.random() * Math.PI * 2
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0xccff99,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Larger glow orbs ──
    const orbCount = 12
    const orbs = []
    const orbGeo = new THREE.SphereGeometry(0.04, 8, 8)
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0xaaffaa,
      transparent: true,
      opacity: 0.6,
    })

    for (let i = 0; i < orbCount; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat.clone())
      orb.position.set(
        (Math.random() - 0.5) * 8,
        1 + Math.random() * 5,
        (Math.random() - 0.5) * 6
      )
      scene.add(orb)
      orbs.push({
        mesh: orb,
        baseY: orb.position.y,
        speed: 0.3 + Math.random() * 0.5,
        amplitude: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.3,
        driftZ: (Math.random() - 0.5) * 0.3,
      })
    }

    // ── Water droplets on leaves (small spheres) ──
    const dropletMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.3,
      ior: 1.33,
      transparent: true,
      opacity: 0.6,
    })
    const dropletGeo = new THREE.SphereGeometry(0.02, 8, 8)

    leaves.forEach((leafData, idx) => {
      if (idx % 3 === 0) {
        const droplet = new THREE.Mesh(dropletGeo, dropletMat)
        droplet.position.copy(leafData.mesh.position)
        droplet.position.y += 0.05
        droplet.position.x += (Math.random() - 0.5) * 0.1
        const parent = leafData.mesh.parent
        if (parent) parent.add(droplet)
      }
    })

    // ── Animation ──
    const clock = new THREE.Clock()
    let animationId

    function animate() {
      animationId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Gentle camera orbit
      camera.position.x = Math.sin(t * 0.08) * 1.2
      camera.position.z = 8 + Math.cos(t * 0.06) * 0.8
      camera.position.y = 3 + Math.sin(t * 0.1) * 0.3
      camera.lookAt(0, 2.5, 0)

      // Leaf sway (wind effect)
      leaves.forEach((l) => {
        const wind = Math.sin(t * l.speed + l.phase) * l.amplitude
        const gust = Math.sin(t * 0.3 + l.phase * 0.5) * l.amplitude * 0.5
        l.mesh.rotation.z = l.baseRotZ + wind + gust
        l.mesh.rotation.x = l.baseRotX + wind * 0.4
      })

      // Floating particles drift
      const positions = particles.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3] += Math.sin(t * particleSpeeds[i] + particlePhases[i]) * 0.002
        positions[i3 + 1] += particleSpeeds[i] * 0.003
        positions[i3 + 2] += Math.cos(t * particleSpeeds[i] * 0.7 + particlePhases[i]) * 0.002

        // Reset particles that go too high
        if (positions[i3 + 1] > 8) {
          positions[i3 + 1] = 0
          positions[i3] = (Math.random() - 0.5) * 10
          positions[i3 + 2] = (Math.random() - 0.5) * 10
        }
      }
      particles.geometry.attributes.position.needsUpdate = true

      // Particle pulsing opacity
      particleMat.opacity = 0.5 + Math.sin(t * 1.5) * 0.2

      // Glow orbs float
      orbs.forEach((o) => {
        o.mesh.position.y = o.baseY + Math.sin(t * o.speed + o.phase) * o.amplitude
        o.mesh.position.x += o.driftX * 0.003
        o.mesh.position.z += o.driftZ * 0.003
        o.mesh.material.opacity = 0.3 + Math.sin(t * o.speed * 2 + o.phase) * 0.3

        // Wrap around
        if (o.mesh.position.x > 5) o.mesh.position.x = -5
        if (o.mesh.position.x < -5) o.mesh.position.x = 5
        if (o.mesh.position.z > 4) o.mesh.position.z = -4
        if (o.mesh.position.z < -4) o.mesh.position.z = 4
      })

      // Subtle main plant sway
      plantGroup.rotation.z = Math.sin(t * 0.4) * 0.015
      plantGroup.rotation.x = Math.cos(t * 0.3) * 0.01

      // Light animation
      rimLight.intensity = 0.6 + Math.sin(t * 0.8) * 0.3

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize handler ──
    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ──
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a472a 0%, #2d5a27 40%, #1b3a1f 100%)' }}
    />
  )
}
