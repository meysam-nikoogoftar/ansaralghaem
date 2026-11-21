import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// Full 3D scene; the original SVG stays in the DOM as an immediate fallback.
export function createShrineWebGL(root) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, failIfMajorPerformanceCaveat: true, powerPreference: 'default' })
  if (!context) return null
  const debug = context.getExtension('WEBGL_debug_renderer_info')
  const gpu = debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : ''
  if (/swiftshader|llvmpipe|software|softpipe/i.test(gpu)) {
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return null
  }
  let renderer
  try { renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true }) }
  catch { context.getExtension('WEBGL_lose_context')?.loseContext(); return null }
  renderer.setClearColor(0, 0)
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5))
  const scene = new THREE.Scene()
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  const camera = new THREE.PerspectiveCamera(38, 466 / 376, 1, 1500)
  camera.position.set(35, 210, 690)
  camera.lookAt(0, 175, 0)
  const model = new THREE.Group()
  scene.add(model)
  const environment = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const lighting = pmrem.fromScene(environment, .04)
  scene.environment = lighting.texture
  environment.dispose()
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0xfff2d8, 0x324d48, 2.2))
  const key = new THREE.DirectionalLight(0xffe4ab, 4)
  key.position.set(-250, 380, 300)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xc5e8ff, 3)
  rim.position.set(200, 250, -200)
  scene.add(rim)
  const tiles = document.createElement('canvas')
  tiles.width = 1024; tiles.height = 512
  const tilePaint = tiles.getContext('2d')
  tilePaint.fillStyle = '#c6a453'; tilePaint.fillRect(0, 0, 1024, 512)
  tilePaint.strokeStyle = '#725423'; tilePaint.lineWidth = 2
  for (let row=0;row<32;row++) {
    for(let col=-1;col<33;col++) tilePaint.strokeRect(col*32+(row%2)*16,row*16,32,16)
  }
  const tileMap = new THREE.CanvasTexture(tiles)
  const gold = new THREE.MeshStandardMaterial({ color: 0xe7b74c, metalness: .82, roughness: .27, bumpMap: tileMap, bumpScale: .55, envMapIntensity: 1.3 })
  const polished = new THREE.MeshStandardMaterial({ color: 0xeac566, metalness: .9, roughness: .18, envMapIntensity: 1.5 })
  const profile = [[200,0],[196,8],[181,24],[156,45],[123,68],[87,91],[53,112],[28,132],[13,148],[0,158]].map(([r,y])=>new THREE.Vector2(r,y))
  const dome = new THREE.Mesh(new THREE.LatheGeometry(profile,96),gold)
  model.add(dome)
  const add = (geometry,material,y) => {
    const part = new THREE.Mesh(geometry,material)
    part.position.y=y
    model.add(part)
    return part
  }
  add(new THREE.CylinderGeometry(198,202,9,96),polished,0)
  add(new THREE.CylinderGeometry(7,13,22,32),polished,164)
  add(new THREE.SphereGeometry(15,32,20),polished,187).scale.y=.65
  add(new THREE.LatheGeometry([[0,0],[15,6],[22,16],[18,25],[7,37],[2,48]].map(([r,y])=>new THREE.Vector2(r,y)),48),polished,199)
  add(new THREE.SphereGeometry(11,32,20),polished,257).scale.y=.7
  add(new THREE.LatheGeometry([[0,0],[10,4],[14,12],[9,21],[2,30]].map(([r,y])=>new THREE.Vector2(r,y)),48),polished,270)
  add(new THREE.SphereGeometry(6,24,16),polished,308)
  add(new THREE.CylinderGeometry(1.5,1.8,224,16),polished,270)
  const pointer = new THREE.Vector2()
  const move = event => {
    if(event.pointerType === 'touch') return
    const bounds=root.getBoundingClientRect()
    pointer.set((event.clientX-bounds.left)/bounds.width-.5,(event.clientY-bounds.top)/bounds.height-.5)
  }
  const leave = () => pointer.set(0,0)
  root.addEventListener('pointermove',move,{passive:true})
  root.addEventListener('pointerleave',leave)
  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = 1024
  textureCanvas.height = 512
  const paint = textureCanvas.getContext('2d')
  paint.fillStyle = '#b60920'
  paint.fillRect(0, 0, 1024, 512)
  paint.fillStyle = '#fff1dc'
  paint.font = 'bold 220px serif'
  paint.textAlign = 'center'
  paint.textBaseline = 'middle'
  paint.direction = 'rtl'
  paint.fillText('یا حسین', 512, 270)
  const texture = new THREE.CanvasTexture(textureCanvas)
  const geometry = new THREE.PlaneGeometry(180, 105, 72, 24)
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, cloth: { value: texture } },
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float time;
      varying vec2 clothUV;
      varying float fold;
      void main() {
        clothUV = uv;
        float freeEdge = 1.0 - uv.x;
        float phase = freeEdge * 10.0 - time * 3.6;
        vec3 p = position;
        p.z += sin(phase) * freeEdge * 14.0;
        p.y += sin(phase) * freeEdge * 9.0 - freeEdge * 9.0;
        p.x += sin(phase * 0.7) * freeEdge * 2.0;
        fold = cos(phase) * freeEdge;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D cloth;
      varying vec2 clothUV;
      varying float fold;
      void main() {
        vec3 color = texture2D(cloth, clothUV).rgb;
        float weave = sin(clothUV.x * 1800.0) * sin(clothUV.y * 900.0) * 0.018;
        float light = 0.83 + fold * 0.18;
        float sheen = pow(max(0.0, fold), 8.0) * 0.12;
        gl_FragColor = vec4(color * (light + weave) + sheen * vec3(1.0, 0.55, 0.36), 1.0);
      }
    `,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(-90, 326, 3)
  model.add(mesh)
  canvas.className = 'shrine-webgl'
  canvas.setAttribute('aria-hidden', 'true')
  const original = root.querySelector('svg')
  let failed = false
  let disposed = false
  let shaderFailed = false
  renderer.debug.onShaderError = () => { shaderFailed = true }
  const lost = event => { event.preventDefault(); failed = true }
  canvas.addEventListener('webglcontextlost', lost)
  const resize = () => {
    const width = root.clientWidth
    renderer.setSize(width, width * 376 / 466, false)
  }
  const observer = new ResizeObserver(resize)
  const dispose = () => {
    if (disposed) return
    disposed = true
    observer.disconnect()
    canvas.removeEventListener('webglcontextlost', lost)
    canvas.remove()
    original.style.visibility = ''
    delete root.dataset.renderer
    root.removeEventListener('pointermove',move)
    root.removeEventListener('pointerleave',leave)
    const geometries = new Set()
    const materials = new Set()
    model.traverse(object => { if(object.geometry) geometries.add(object.geometry); if(object.material) materials.add(object.material) })
    geometries.forEach(item=>item.dispose())
    materials.forEach(item=>item.dispose())
    texture.dispose(); tileMap.dispose(); lighting.dispose()
    renderer.dispose(); renderer.forceContextLoss()
  }
  try {
    resize()
    renderer.render(scene, camera)
    if (shaderFailed) { dispose(); return null }
    root.append(canvas)
    original.style.visibility = 'hidden'
    root.dataset.renderer = 'webgl'
    observer.observe(root)
  } catch { dispose(); return null }
  return {
    render(seconds) {
      if (failed) return false
      material.uniforms.time.value = seconds
      model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, pointer.x*.22 + Math.sin(seconds*.22)*.035, .035)
      model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, pointer.y*.045, .035)
      try { renderer.render(scene, camera); return !shaderFailed } catch { return false }
    },
    dispose,
  }
}
