// https://threejs.org/manual/#ko/materials
// https://threejs.org/manual/#ko/textures
// https://threejs.org/manual/#ko/cameras
// https://threejs.org/manual/#ko/rendering-on-demand
import * as THREE from 'three';
import './week4.css'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

class MinMaxGUIHelper {

  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }

  get min() {
    return this.obj[this.minProp];
  }

  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }

  get max() {
    return this.obj[this.maxProp];
  }

  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min; // NOTE this will call the min setter
  }

}

function main() {

  const canvas = document.createElement("canvas")

  canvas.setAttribute("id", "threejs-canvas")
  document.body.appendChild(canvas)

  const splitDiv = document.createElement("div")
  splitDiv.className = "split"
  document.body.appendChild(splitDiv)

  const viewEls = []
  for (let i=0 ; i < 2 ; i++) {
    const viewEl = document.createElement("div")
    viewEl.setAttribute("id", `view${i+1}`)
    viewEl.setAttribute("tabindex", `${i+1}`)
    splitDiv.appendChild(viewEl)
    viewEls.push(viewEl)
  }


  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const aspect = window.clientWidth / window.clientHeight; // the canvas default
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.set(0, 10, 20);

  const camera2 = new THREE.PerspectiveCamera(60, aspect, 0.1, 500)
  camera2.position.set(40, 10, 30)
  camera2.lookAt(0, 5, 0)
  
  // gui 변경을 반영해 프로젝션 매트릭스 업데이트와 rendering 을 하기 위해 함수 설정
  // PerspectiveCamera 의 프로젝션 매트릭스를 업데이트하는 역할. 카메라 설정값(fov, aspect, near, far) 중에 하나라도 바뀐다면 호출해야함
  // 프로젝션 매트릭스는 3d 공간의 점들을 2d 화면에 투영할 때 사용되는 수학적 변환을 정의하는 매트릭스
  function updateByUI() {
    camera.updateProjectionMatrix() 
    render()
  }
  
  const gui = new GUI();
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);

  gui.add(camera, 'fov', 1, 180).onChange(updateByUI);
  gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateByUI);
  gui.add(minMaxGUIHelper, 'max', 0.1, 100, 0.1).name('far').onChange(updateByUI); 
  // gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(() => { camera.updateProjectionMatrix() });

  // 특정 좌표를 중심으로 카메라를 자전 또는 공전(orbit)
  const controls = new OrbitControls(camera, viewEls[0]);
  controls.enableDamping = true; // 부드러운 동작
  controls.target.set(0, 5, 0); // 아래 큐브와 구의 중심지점을 기준으로 카메라가 움직임. 
  controls.update();

  const controls2 = new OrbitControls(camera2, viewEls[1]);
  controls.enableDamping = true; // 부드러운 동작
  controls2.target.set(0, 5, 0);
  controls2.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');
  const axes = new THREE.AxesHelper();
  scene.add(axes)
  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);

  {

    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping; // 수평래핑 : 텍스쳐 반복
    texture.wrapT = THREE.RepeatWrapping; // 수직래핑 : 텍스쳐 반복
    texture.magFilter = THREE.NearestFilter; // 텍스쳐의 크기가 원본보다 클 때, 텍스처에서 가장 가까운 픽셀을 골라 텍스쳐를 표현함
    // 텍스처에 적용되는 색상 공간(텍스처의 색상을 어떻게 해석하고 렌더링할지 결정)을 정의하는 속성
    // texture.colorSpace = THREE.SRGBColorSpace; // 이미지 텍스처를 텍스처로 로드할 떄 주로 사용. 정확하게 텍스처 렌더링
    texture.colorSpace = THREE.LinearSRGBColorSpace // 3D 렌더링과 조명 계산에서 사용하는 색상 공간. 조명 계산이 올바르게 수행되기 위해선, 텍스처가 선형 공간에 있어야하기 때문에. sRGB 는 비선형 공간이라고 함
    // 여기선 조명을 쓰고 있기 때문에 colorSpace 를 Linear 로 사용하는 것 같다.

    const repeats = planeSize / 2; 
    texture.repeat.set(repeats, repeats); // 텍스처에 사용되는 이미지에서 칸하나를 1*1로 잡기위해.

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide, // 카메라를 뒤집어보면 아무것도 안보이는데 조명이 없어서 그렇게 보임. 
    });
    scene.add(new THREE.AmbientLight()); // 평면 반대편 확인용

    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * - .5; 
    // x 축을 기준으로 -90 도 만큼 (-는 시계반대방향으로) 회전
    // 사실 - 가 아니라 + 로 해도된다. 왜냐면 double side rendering 이고 영향 받을 다른 자식들도 없으니까.
    scene.add(mesh);
  }

  // 정육면체와 구가 평면위에 살짝 대칭으로 얹혀지도록 위치수정
  {

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize/2 + 1, cubeSize / 2, 0); 
    scene.add(mesh);

  }


  {
    // 명암 차이를 쉽게 확인할 수 있도록 flatshading, widthSegments, heightSegments 등을 설정
    const sphereRadius = 2;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius, 0);
    scene.add(mesh);
  }

  {
    // 다양한 materials
    const sphereRadius = 1;
    const sphereWidthDivisions = 8;
    const sphereHeightDivisions = 4;
    const color = 'purple'
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const shpereMats = [
      new THREE.MeshLambertMaterial({ color: color, flatShading: true }), // 정점에서만 광원계산
      new THREE.MeshPhongMaterial({ color: color, flatShading: true, shininess: 150 }), // 픽셀하나하나 광원 계산, shininess 반사점의 밝기 조절
      new THREE.MeshToonMaterial({ color: color }),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: color, roughness: 1, metalness: 1 }),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.5 }),
      new THREE.MeshPhysicalMaterial({ color: color, roughness: 0.5, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1 }),
      new THREE.MeshNormalMaterial(),
    ]

    for (let i = 0; i < shpereMats.length; i++) {
      const mesh = new THREE.Mesh(sphereGeo, shpereMats[i]);
      mesh.position.set((sphereRadius * 2 + 1) * (i - shpereMats.length/2) , sphereRadius, 5);
      scene.add(mesh);
    }


  }

  {
    // 다양한 textures
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const materials = [ 
      // 6개 면을 모두 넣어주지 않으면 면이 렌더링 되지 않는다. 같은 리소스를 반복하더라도 네트워크 낭비는 없음
      // 로드 된 후에 매핑하기 때문에 최초에는 큐브가 보이지 않는다. 
      // Q : 투명하게 보인다고 했는데, 까맣게 보이게된다. 씬 배경이나 조명과도 상관없음. 바닥 평면 역시 마찬가지. 이유가 뭘까?
      new THREE.MeshPhongMaterial({ map: loadColorTexture(require('../assets/flower-1.jpg')) }),
      new THREE.MeshPhongMaterial({ map: loadColorTexture(require('../assets/flower-2.jpg')) }),
      new THREE.MeshPhongMaterial({ map: loadColorTexture(require('../assets/flower-3.jpg')) }),

      new THREE.MeshBasicMaterial({ map: loadColorTexture(require('../assets/flower-4.jpg')) }),
      new THREE.MeshBasicMaterial({ map: loadColorTexture(require('../assets/flower-5.jpg')) }),
      new THREE.MeshBasicMaterial({ map: loadColorTexture(require('../assets/flower-6.jpg')) }),
    ];

    function loadColorTexture(path) {
      const texture = loader.load(path); 
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }
    // 까맣게 보이는 이슈 해결. 텍스쳐가 모두 로딩 된 후 렌더함수재호출
    loadManager.onLoad = () => {
      const cube = new THREE.Mesh(cubeGeo, materials);
      cube.position.set(0, cubeSize, -10)
      scene.add(cube);
      render()
    };
  }

  {

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(- 5, 0, 0);
    // 위에서 살짝 왼쪽 아래를 향해 비춰지도록. 오른쪽 위쪽에서 사선으로 꽂히는 빛평면.
    scene.add(light);
    scene.add(light.target);

  }

  function setScissorForElement(elem) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    // canvas에 대응하는 사각형을 구하기
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);

    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);

    // canvas의 일부분만 렌더링하도록 scissor 적용
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    // 비율 반환
    return width / height;
  }

  function resizeRendererToDisplaySize(renderer) {

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {

      renderer.setSize(width, height, false);

    }

    return needResize;

  }

  // 애니메이션이 있는 경우가 아니라면, 불필요한 렌더링을 반복할 필요가 없음.
  // 변호가 있을 때만 렌더링 하도록 변경함.
  function render() {

    resizeRendererToDisplaySize(renderer)
    renderer.setScissorTest(true);

    {
      const aspect = setScissorForElement(viewEls[0]);

      // 비율에 따라 카메라 조정
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      cameraHelper.update();

      // 기존 화면에서 가이드라인(CameraHelper)이 노출되지 않도록 설정
      cameraHelper.visible = false;

      scene.background.set(0x000000);

      // 렌더링
      renderer.render(scene, camera);
    }

    // 두 번째 카메라 렌더링
    {
      const aspect = setScissorForElement(viewEls[1]);

      // 비율에 따라 카메라 조정
      camera2.aspect = aspect;
      camera2.updateProjectionMatrix();

      // 가이드라인 활성화
      cameraHelper.visible = true;

      scene.background.set(0x000040);

      renderer.render(scene, camera2);
    }

  }

  controls.addEventListener('change', render);
  controls2.addEventListener('change', render)
  window.addEventListener('resize', render);
  render();
}

main();
