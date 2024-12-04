import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import car from '../assets/ufo/scene.gltf'
import '../assets/ufo/scene.bin'
import '../assets/ufo/textures/UFO_BLACK_baseColor.png'
import '../assets/ufo/textures/UFO_BLACK_normal.png'
import '../assets/ufo/textures/UFO_BLACK_metallicRoughness.png'
import '../assets/ufo/textures/UFO_Metal_baseColor.png'
import '../assets/ufo/textures/Ventanilla_baseColor.png'

import background from "../assets/shoppingmall.hdr"


import './week4.css'

//https://polyhaven.com/a/royal_esplanade
//https://sketchfab.com/3d-models/ufo-flying-saucer-spaceship-ovni-094ce2baf6ee40aa8f083b7d0fcf0a9f
//https://threejs.org/examples/webgl_loader_gltf

const canvas = document.createElement("canvas")
canvas.setAttribute("id", "threejs-canvas")
document.body.appendChild(canvas)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 120);
camera.position.set(0, -2, 12);

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);





const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render); // use if there is no animation loop

// 줌 기능 완전히 비활성화
controls.enableZoom = false;

// 회전, 이동 속도 조정
controls.rotateSpeed = 1.0;
controls.panSpeed = 0.8;

// 기본 회전 활성화 상태 유지
controls.enableRotate = true;

// 기본 팬(이동) 활성화 상태 유지
controls.enablePan = true;
controls.enableDamping = true; // 부드러운 동작
controls.target.set(0, 0, 0);
controls.update();

window.addEventListener('resize', onWindowResize);


new RGBELoader()
  .load(background, function (texture) {

    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = texture;
    scene.environment = texture;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.4;
    render();

    const loader = new GLTFLoader()
    loader.load(car, async function (gltf) {

      const model = gltf.scene;

      // wait until the model can be added to the scene without blocking due to shader compilation
      await renderer.compileAsync(model, camera, scene);
      scene.add(model);
      render();

    });

  });

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();

}

function render() {
  renderer.render(scene, camera);
}

render()