import _ from 'lodash';
import './style.css';
import * as THREE from 'three';

// creaate canvas
const canvasEl = document.createElement("canvas")

canvasEl.setAttribute("id", "threejs-canvas")
document.body.appendChild(canvasEl)

// create renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl });

// create camera
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

// create scene
const scene = new THREE.Scene();

// create light
const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// create cubes
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({ color });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

const cubes = [
  makeInstance(geometry, 0x44aa88, 0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844, 2),
];


// render
function resizeRendererToDisplaySize(renderer, camera) {
  const canvas = renderer.domElement;

  const pixelRatio = window.devicePixelRatio;
  // const width = canvas.clientWidth;
  // const height = canvas.clientHeight;
  // const needResize = canvas.width !== width || canvas.height !== height;

  const width = Math.floor(canvas.clientWidth * pixelRatio);
  const height = Math.floor(canvas.clientHeight * pixelRatio);
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  return needResize;
}

function render(time) {
  time *= 0.001;  // convert time to seconds

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  resizeRendererToDisplaySize(renderer, camera)
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);