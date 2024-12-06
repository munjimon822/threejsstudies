import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
// import * as SkeletonUtils  from 'three/addons/utils/SkeletonUtils.js';

import flower from '../assets/hibiscus/scene.gltf'
import '../assets/hibiscus/scene.bin'
import '../assets/hibiscus/textures/Dirt_baseColor.jpeg'
import '../assets/hibiscus/textures/Dirt_metallicRoughness.png'
import '../assets/hibiscus/textures/Dirt_specularf0.png'
import '../assets/hibiscus/textures/Leaf_baseColor.png'
import '../assets/hibiscus/textures/Petale_baseColor.png'
import '../assets/hibiscus/textures/Pistil_baseColor.png'
import '../assets/hibiscus/textures/Sepale_baseColor.png'
import '../assets/hibiscus/textures/Sepale_emissive.png'

import background from "../assets/autumn_field_4k.hdr"

import './week5-2.css'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
//https://polyhaven.com/a/royal_esplanade
//https://sketchfab.com/3d-models/ufo-flying-saucer-spaceship-ovni-094ce2baf6ee40aa8f083b7d0fcf0a9f
//https://threejs.org/examples/webgl_loader_gltf


let canvas, camera, scene, renderer, controls, root, composer
const position = { x: 0, y: 0 }
const raycaster = new THREE.Raycaster()
const clock = new THREE.Clock()

function setPickEvents() {

    function getCanvasRelativePosition(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height,
      };
    }

    function setPickPosition(event) {
      const pos = getCanvasRelativePosition(event);
      position.x = (pos.x / canvas.width) * 2 - 1;
      position.y = (pos.y / canvas.height) * -2 + 1; // Y 축을 뒤집었음
      raycaster.setFromCamera(position, camera);
      // 광선과 교차하는 물체들을 배열로 만듭니다
      const intersectedObjects = raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        // 첫 번째 물체가 제일 가까우므로 해당 물체를 고릅니다
        const pickedObject = intersectedObjects[0].object;
        let current = pickedObject;
        let isAncestor = false;

        while (current.parent) {
          if (current.parent === root) {
            isAncestor = true;
            break;
          }
          current = current.parent;
        }

        if (isAncestor) {
          if (animationActive) {
            stopAnimation()
          } else {
            replayAnimation()
          }
        }
      }
    }


    function clearPickPosition() {
      /**
       * 마우스의 경우는 항상 위치가 있어 그다지 큰
       * 상관이 없지만, 터치 같은 경우 사용자가 손가락을
       * 떼면 피킹을 멈춰야 합니다. 지금은 일단 어떤 것도
       * 선택할 수 없는 값으로 지정해두었습니다
       **/
      position.x = -100000;
      position.y = -100000;
    }


    window.addEventListener('mousedown', setPickPosition);
    window.addEventListener('mouseup', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);

    window.addEventListener('touchstart', (event) => {
      event.preventDefault(); // 스크롤 이벤트 방지
      setPickPosition(event.touches[0]);
    }, { passive: false });

    window.addEventListener('touchend', clearPickPosition);
  
}



function init() {
  canvas = document.createElement("canvas")
  canvas.setAttribute("id", "threejs-canvas")
  document.body.appendChild(canvas)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 120);
  camera.position.set(0.7831, -0.0859, 0.8682);
  camera.quaternion.set(0.0342, 0.3585, 0.3585, -0.0131)
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render); // use if there is no animation loop

  // 줌 기능 완전히 비활성화
  controls.enableZoom = false;

  // 회전, 이동 속도 조정
  controls.rotateSpeed = 1.0;
  controls.panSpeed = 0.8;

  // 기본 회전 활성화 상태 유지
  controls.enableRotate = true;
  const initialPolarAngle = Math.atan2(
    Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2), // xy 평면 거리
    camera.position.y // y축 값
  );
  
  // 초기 polarAngle 값으로 제한 설정
  controls.minPolarAngle = initialPolarAngle;
  controls.maxPolarAngle = initialPolarAngle;

  // 기본 팬(이동) 활성화 상태 유지
  controls.enablePan = true;
  controls.enableDamping = true; // 부드러운 동작
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener('resize', onWindowResize);

  composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight)
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), // 해상도
    0.25,  // 강도 (Bloom Strength)
    0.1,  // 반경 (Bloom Radius)
    0  // 임계값 (Bloom Threshold)
  );

  // 컴포저에 추가
  composer.addPass(bloomPass);
  const filmPass = new FilmPass(
    0.7,   // 강도
    false,  // 흑백
  );
  composer.addPass(filmPass);
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // const params = {
  //   bloomStrength: 1.5,
  //   bloomRadius: 0.4,
  //   bloomThreshold: 0.85,
  // };

  // const gui = new GUI();
  // gui.add(params, 'bloomStrength', 0, 3).onChange((value) => {
  //   bloomPass.strength = value;
  // });
  // gui.add(params, 'bloomRadius', 0, 1).onChange((value) => {
  //   bloomPass.radius = value;
  // });
  // gui.add(params, 'bloomThreshold', 0, 1).onChange((value) => {
  //   bloomPass.threshold = value;
  // });
}


let mixer
let animationActive = false;

function stopAnimation() {
  if (mixer) {
    animationActive = false; // 애니메이션 비활성화
    clock.stop()
    const actions = mixer._actions;
    actions.forEach((action) => {
      action.paused = true
    });
  }
}

function replayAnimation() {
  if (mixer) {
    animationActive = true; // 애니메이션 활성화
    clock.start()
    const actions = mixer._actions; // 모든 액션 가져오기
    actions.forEach((action) => {
      if (action.paused) {
        action.paused = false
      } else {
        action.reset(); // 처음으로 리셋
        action.play(); // 재생
      }

    });
    requestAnimationFrame(renderAnimation); // 렌더 루프 시작
  }
}

function playAnimation() {
  if (mixer) {
    animationActive = true; // 애니메이션 활성화
    clock.start()
    const actions = mixer._actions;
    actions.forEach((action) => {
      action.play();
    });
    requestAnimationFrame(renderAnimation); // 렌더 루프 시작
  }
}

let progressBar, loadingDiv

function setLoadingBar() {
  // #loading 생성
  loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading';

  // 내부 구조 생성
  const innerDiv = document.createElement('div');

  const loadingText = document.createElement('div');
  loadingText.textContent = '...loading...';

  const progressDiv = document.createElement('div');
  progressDiv.className = 'progress';

  progressBar = document.createElement('div');
  progressBar.id = 'progressbar';

  // 구조 조합
  progressDiv.appendChild(progressBar);
  innerDiv.appendChild(loadingText);
  innerDiv.appendChild(progressDiv);
  loadingDiv.appendChild(innerDiv);

  // DOM에 추가
  document.body.appendChild(loadingDiv);
}

setLoadingBar()

const manager = new THREE.LoadingManager()

manager.onProgress = (item, loaded, total) => {
  const progress = (loaded / total) * 100;
  progressBar.style.width = `${progress}%`; // 프로그레스 바 업데이트
};

manager.onLoad = () => {
  console.log('Loading complete');
  removeLoadingBar(); // 로딩 바 제거

};

// 로딩 바 제거 함수
function removeLoadingBar() {
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

loadModel()


function loadModel() {
  new RGBELoader(manager)
    .load(background, function (texture) {

      texture.mapping = THREE.EquirectangularReflectionMapping;

      const loader = new GLTFLoader(manager)
      loader.load(flower, async function (gltf) {
        
        init()
        
        scene.background = texture;
        scene.environment = texture;

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.4;

        const model = gltf.scene;
        const animations = gltf.animations
        // wait until the model can be added to the scene without blocking due to shader compilation
        root = new THREE.Object3D();
        root.add(model);
        scene.add(root);

        if (animations && animations.length) {
          mixer = new THREE.AnimationMixer(model);
          const clip = animations[0]
          const action = mixer.clipAction(clip)
          action.timeScale = 0.3
          action.setLoop(THREE.LoopPingPong);

          playAnimation();
        } else {
          render()
        }
        setPickEvents()
      });

    });

}



function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.width, window.height)
  render();

}



function renderAnimation() {
  if (animationActive) {
    const delta = clock.getDelta()
    if (mixer) {
      mixer.update(delta)
    }

    // renderer.render(scene, camera);
    composer.render(delta)
    requestAnimationFrame(renderAnimation);
  }
}

function render() {
  // renderer.render(scene, camera);
  const delta = clock.getDelta()
  composer.render(delta)
}
