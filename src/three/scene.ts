import * as THREE from 'three';

// Храним ссылки для управления извне
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particleSystem: THREE.Points;
let animationFrameId: number;

// Конфигурация
const PARTICLE_COUNT = 1500;
let isFalling = false; // Флаг, который мы включим при скролле
let scrollProgress = 0; // От 0 до 1, если нужно привязать силу ветра к скроллу

/**
 * Генерируем "дымную/пепельную" текстуру на лету, чтобы не грузить картинки.
 * Форма будет слегка асимметричной и размытой (как мягкий хлопок).
 */
function createAshTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Смещаем центр градиента, чтобы форма не была идеальным кругом
  const cx = 32,
    cy = 28;
  const gradient = ctx.createRadialGradient(cx, cy, 0, 32, 32, 32);

  // Создаем очень мягкий переход (дымный эффект)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
  gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.5)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// export function initParticleScene(canvas: HTMLCanvasElement) {
//   // 1. Инициализация базовой сцены
//   scene = new THREE.Scene();

//   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
//   camera.position.z = 100;

//   // alpha: true крайне важно, чтобы просвечивал кремовый фон #FBF5E9
//   renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//   // 2. Создание частиц (Буферная геометрия)
//   const geometry = new THREE.BufferGeometry();
//   const positions = new Float32Array(PARTICLE_COUNT * 3);
//   const sizes = new Float32Array(PARTICLE_COUNT);
//   const opacities = new Float32Array(PARTICLE_COUNT);

//   // Кастомные атрибуты для физики
//   const velocities = new Float32Array(PARTICLE_COUNT * 3);
//   const phases = new Float32Array(PARTICLE_COUNT); // Для случайного покачивания

//   for (let i = 0; i < PARTICLE_COUNT; i++) {
//     // Стартовая позиция: кучно в верхней части экрана (где видео-клякса)
//     // Разброс по X и Z для объема, по Y прячем чуть выше видимой зоны
//     positions[i * 3] = (Math.random() - 0.5) * 200; // x
//     positions[i * 3 + 1] = 40 + Math.random() * 40; // y (стартуют сверху)
//     positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z (глубина)

//     // Разные размеры для "разнородности" (от крошечной пыли до крупных хлопьев)
//     sizes[i] = Math.random() * 8 + 2;

//     // Разная прозрачность для глубины
//     opacities[i] = Math.random() * 0.6 + 0.1;

//     // Скорости: медленное падение, небольшой дрейф в стороны
//     velocities[i * 3] = (Math.random() - 0.5) * 0.05; // vx
//     velocities[i * 3 + 1] = -(Math.random() * 0.08 + 0.02); // vy (гравитация, отрицательная)
//     velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05; // vz

//     phases[i] = Math.random() * Math.PI * 2;
//   }

//   geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//   geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
//   geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

//   // Сохраняем физику в userData геометрии, чтобы обновлять ее в цикле
//   geometry.userData = { velocities, phases };

//   // 3. Создаем шейдерный материал (позволяет индивидуальные размеры и прозрачность)
//   const material = new THREE.ShaderMaterial({
//     uniforms: {
//       uTime: { value: 0 },
//       uTexture: { value: createAshTexture() },
//       // Цвет берем темный, он растворится через mix-blend-multiply на кремовом фоне
//       uColor: { value: new THREE.Color('#1c1917') },
//     },
//     vertexShader: `
//       attribute float aSize;
//       attribute float aOpacity;
//       varying float vOpacity;

//       void main() {
//         vOpacity = aOpacity;
//         vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
//         // Зависимость размера от перспективы (ближе = больше)
//         gl_PointSize = aSize * (100.0 / -mvPosition.z);
//         gl_Position = projectionMatrix * mvPosition;
//       }
//     `,
//     fragmentShader: `
//       uniform sampler2D uTexture;
//       uniform vec3 uColor;
//       varying float vOpacity;

//       void main() {
//         vec4 texColor = texture2D(uTexture, gl_PointCoord);
//         // Отбрасываем пустые пиксели для оптимизации
//         if (texColor.a < 0.01) discard;
//         gl_FragColor = vec4(uColor, texColor.a * vOpacity);
//       }
//     `,
//     transparent: true,
//     depthWrite: false, // Отключаем запись глубины, чтобы частицы не перекрывали друг друга "квадратами"
//     blending: THREE.NormalBlending,
//   });

//   particleSystem = new THREE.Points(geometry, material);
//   scene.add(particleSystem);

//   // Слушатель ресайза
//   window.addEventListener('resize', onWindowResize);

//   // Запуск цикла
//   tick();
// }
//
export function initParticleScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  console.log(cube);
  camera.position.z = 5;
}

/**
 * Цикл анимации
 */
function tick() {
  animationFrameId = requestAnimationFrame(tick);

  if (particleSystem) {
    const geometry = particleSystem.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const { velocities, phases } = geometry.userData;

    // Передаем время в шейдер
    const material = particleSystem.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value += 0.01;

    // Анимация частиц
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      phases[i] += 0.01;

      // Если скролл пошел, включаем гравитацию, иначе частицы "зависли" в дыму
      if (isFalling) {
        positions[i * 3] += velocities[i * 3] + Math.sin(phases[i]) * 0.02; // X: дрейф + турбулентность
        positions[i * 3 + 1] += velocities[i * 3 + 1] * (1 + scrollProgress * 2); // Y: падение (ускоряется при скролле)
        positions[i * 3 + 2] += velocities[i * 3 + 2]; // Z: микро-глубина

        // Бесконечный цикл: если частица улетела вниз (в следующую секцию),
        // плавно возвращаем ее наверх с новой случайной позицией
        if (positions[i * 3 + 1] < -100) {
          positions[i * 3 + 1] = 80 + Math.random() * 20; // Спавн сверху
          positions[i * 3] = (Math.random() - 0.5) * 200;
        }
      } else {
        // До начала скролла частицы просто слегка "дышат" внутри кляксы
        positions[i * 3] += Math.sin(phases[i]) * 0.005;
        positions[i * 3 + 1] += Math.cos(phases[i]) * 0.005;
      }
    }

    // Сообщаем WebGL, что координаты изменились
    geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// ==========================================
// API ДЛЯ УПРАВЛЕНИЯ ИЗ VUE / GSAP
// ==========================================

/**
 * Вызывается из ScrollTrigger, когда начинается скролл вниз
 */
export function triggerParticlesFall(state: boolean = true) {
  isFalling = state;
}

/**
 * Передает прогресс скролла для изменения динамики частиц
 * @param progress от 0 до 1
 */
export function updateParticlesProgress(progress: number) {
  scrollProgress = Math.max(0, Math.min(1, progress));
}

/**
 * Очистка памяти (важно для SPA/Vue при переходах между страницами)
 */
export function destroyScene() {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', onWindowResize);

  if (renderer) {
    renderer.dispose();
  }
  if (particleSystem) {
    particleSystem.geometry.dispose();
    (particleSystem.material as THREE.Material).dispose();
  }
}
