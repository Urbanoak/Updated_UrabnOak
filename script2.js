// LENIS Scroll + ScrollTrigger
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// THREE.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);
const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
scene.add(hemiLight);

// Load GLTF Model
let model;
let currentColor = "#1e3a8a";
let currentModelPath = "/assets/black_chair.glb";
const loader = new THREE.GLTFLoader();

function loadModel(modelPath) {
  if (model) {
    scene.remove(model);
  }
  
  loader.load(modelPath, function (gltf) {
    model = gltf.scene;
    model.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.color.set(currentColor);
        node.material.metalness = 0.4;
        node.material.roughness = 1;
        node.material.envMapIntensity = 2;
        node.material.needsUpdate = true;
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    scene.add(model);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 1.75;

    model.scale.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    lastManualRotationX = 0;
    lastManualRotationY = 0;
    playInitialAnimation();

    currentModelPath = modelPath;
  });
}

// Initial model load
loadModel("/assets/black_chair.glb");

// Scroll tracking
let currentScroll = 0;
const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
const floatAmplitude = 0.2;
const floatSpeed = 1.5;

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power2.out",
      onComplete: () => {
        model.scale.set(1, 1, 1);
      }
    });
  }
}

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

// Mouse Control
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationY = 0;
let rotationX = 0;
let lastManualRotationY = 0;
let lastManualRotationX = 0;

document.addEventListener("mousedown", (event) => {
  isDragging = true;
  previousMouseX = event.clientX;
  previousMouseY = event.clientY;
});

document.addEventListener("mouseup", () => {
  if (model) {
    lastManualRotationY = model.rotation.y;
    lastManualRotationX = model.rotation.x;
  }
  isDragging = false;
});

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener("mousemove", debounce((event) => {
  if (!isDragging || !model) return;

  let deltaX = (event.clientX - previousMouseX) * 0.005;
  let deltaY = (event.clientY - previousMouseY) * 0.005;

  rotationY += deltaX;
  rotationX += deltaY;

  model.rotation.y = rotationY;
  model.rotation.x = rotationX;

  previousMouseX = event.clientX;
  previousMouseY = event.clientY;
}, 16));

// Animate Function
function animate() {
  if (model) {
    const floatOffset = Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
    model.position.y = floatOffset;

    const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

    if (!isDragging) {
      if (currentModelPath === "/assets/table.glb") {
        model.rotation.y = lastManualRotationY + scrollProgress * Math.PI * 2;
        model.rotation.x = lastManualRotationX;
        model.rotation.z = 0;
      } else if (currentModelPath === "/assets/Vase.glb") {
        model.rotation.y = lastManualRotationY + scrollProgress * Math.PI * 2;
        model.rotation.x = lastManualRotationX;
        model.rotation.z = 0;
      } else {
        model.rotation.x = lastManualRotationX + scrollProgress * Math.PI * 4;
        model.rotation.y = lastManualRotationY;
        model.rotation.z = 0;
      }
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Outro text animation
const splitText = new SplitType(".outro-copy h2", {
  types: "lines",
  lineClass: "line",
});

splitText.lines.forEach((line) => {
  const text = line.innerHTML;
  line.innerHTML = `<span style="display: block; transform: translateY(70px);">${text}</span>`;
});

ScrollTrigger.create({
  trigger: ".outro",
  start: "top center",
  onEnter: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  onLeaveBack: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 70,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  toggleActions: "play reverse play reverse",
});

// 🎨 Color Palette Logic
function updateModelColor(color) {
  if (model) {
    model.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.color.set(color);
        node.material.needsUpdate = true;
      }
    });
  }
  currentColor = color;
}

document.querySelectorAll('.color-btn').forEach((btn) => {
  btn.style.backgroundColor = btn.getAttribute('data-bg');

  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const bgColor = btn.getAttribute('data-bg');
    const textColor = btn.getAttribute('data-color');

    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;

    document.querySelectorAll('h1, h2, p, a').forEach(el => {
      el.style.color = textColor;
    });

    updateModelColor(textColor);
  });
});

// Model Selection Logic
document.querySelectorAll('.model-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const modelPath = btn.getAttribute('data-model');
    loadModel(modelPath);

    rotationY = 0;
    rotationX = 0;
  });
});

// Login Popup Logic
const loginPopup = document.getElementById("login-popup");
const loginLink = document.getElementById("login-link");
const closePopup = document.getElementById("close-popup");
const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginPopup.classList.add("active");
});

closePopup.addEventListener("click", () => {
  loginPopup.classList.remove("active");
  errorMessage.textContent = "";
  loginForm.reset();
});

// Close popup when clicking outside the login container
loginPopup.addEventListener("click", (e) => {
  if (e.target === loginPopup) {
    loginPopup.classList.remove("active");
    errorMessage.textContent = "";
    loginForm.reset();
  }
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "user" && password === "password") {
    localStorage.setItem("isLoggedIn", "true");
    loginPopup.classList.remove("active");
    loginForm.reset();
    window.location.href = "./index2.html";
  } else {
    errorMessage.textContent = "Invalid username or password.";
  }
});

// AR "View in Room" Logic
const script = document.createElement('script');
script.type = 'module';
script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
document.head.appendChild(script);

const arButton = document.querySelector('.ar-btn');
let isARActive = false;

arButton.addEventListener('click', async () => {
  if (isARActive) return;

  const isARSupported = navigator.xr && (await navigator.xr.isSessionSupported('immersive-ar'));

  const modelViewer = document.createElement('model-viewer');
  modelViewer.setAttribute('src', currentModelPath);
  modelViewer.setAttribute('camera-controls', '');
  modelViewer.setAttribute('auto-rotate', '');
  modelViewer.setAttribute('style', 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; background-color: rgba(0,0,0,0.9);');

  modelViewer.addEventListener('load', () => {
    const material = modelViewer.model.materials[0];
    material.pbrMetallicRoughness.baseColorFactor = [
      parseInt(currentColor.slice(1, 3), 16) / 255,
      parseInt(currentColor.slice(3, 5), 16) / 255,
      parseInt(currentColor.slice(5, 7), 16) / 255,
      1
    ];
  });

  if (isARSupported) {
    modelViewer.setAttribute('ar', '');
    modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
  } else {
    const message = document.createElement('div');
    message.textContent = 'AR is not supported on this device. Use a mobile device with AR capabilities.';
    message.style.position = 'absolute';
    message.style.top = '10px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.color = '#fff';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    modelViewer.appendChild(message);
  }

  const closeOverlay = (e) => {
    if (e.target === modelViewer) {
      document.body.removeChild(modelViewer);
      isARActive = false;
      modelViewer.removeEventListener('click', closeOverlay);
      if (isARSupported) {
        modelViewer.removeEventListener('ar-status', arStatusHandler);
      }
    }
  };

  const arStatusHandler = (event) => {
    if (event.detail.status === 'not-presenting') {
      document.body.removeChild(modelViewer);
      isARActive = false;
      modelViewer.removeEventListener('ar-status', arStatusHandler);
      modelViewer.removeEventListener('click', closeOverlay);
    }
  };

  document.body.appendChild(modelViewer);
  isARActive = true;

  modelViewer.addEventListener('click', closeOverlay);
  if (isARSupported) {
    modelViewer.addEventListener('ar-status', arStatusHandler);
  }
});