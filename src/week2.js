import _ from 'lodash';
import './week2.css';
import * as THREE from 'three';

// creaate canvas
const canvasEl = document.createElement("canvas")

canvasEl.setAttribute("id", "threejs-canvas")
document.body.appendChild(canvasEl)

// create renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl });

// create camera
const fov = 65;
const aspect = window.clientWidth/window.clientHeight; // Fixed
const near = 0.1; // Note : not to be too small like 0.001 or too big like 999 
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 1.6, 16)

// create scene
const scene = new THREE.Scene();

// create light
const color = 0xFFFFFF;
const intensity = 2;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const wallInfo = { w: 800, h: 400, x: 0, y: 0, z: -2}
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x5C5A51 });
const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallInfo.w, wallInfo.h),
  wallMaterial
)

wall.position.set(wallInfo.x, wallInfo.y, wallInfo.z)
scene.add(wall)

const leftSideWallInfo = { w: 0.3, h: 400,  x:-10, y: 0, z: 0}
const sideWallMaterial = new THREE.MeshBasicMaterial({ color: 0x5C5A51 });

const leftSideWall = new THREE.Mesh(
  new THREE.BoxGeometry(leftSideWallInfo.w, 800, leftSideWallInfo.h),
  sideWallMaterial
)

leftSideWall.position.set(leftSideWallInfo.x, leftSideWallInfo.y, leftSideWallInfo.z)
scene.add(leftSideWall)

const rightSideWallInfo = { w: 0.3, h: 400, x: 10, y: 0, z: 0 }
const rightSideWall = new THREE.Mesh(
  new THREE.BoxGeometry(rightSideWallInfo.w, 800, rightSideWallInfo.h),
  sideWallMaterial
)

rightSideWall.position.set(rightSideWallInfo.x, rightSideWallInfo.y, rightSideWallInfo.z)
scene.add(rightSideWall)

const floorGeometry = new THREE.BoxGeometry(800, 0.3, 100);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x5C5A51 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -1.2, 10) // Note cause front wall z -40, it should be 10, 다음부터는 기준점을 잘잡기
scene.add(floor)

const ceilGeometry = new THREE.BoxGeometry(800, 0.3, 100);
const ceilrMaterial = new THREE.MeshPhongMaterial({ color: 0x5C5A51 });
const ceil = new THREE.Mesh(ceilGeometry, ceilrMaterial);
ceil.position.set(0, 6, 10) // Note cause front wall z -40, it should be 10, 다음부터는 기준점을 잘잡기
scene.add(ceil)

// create standar
function createStander(x,y,z) {
  const material = new THREE.MeshPhongMaterial({ color: 0xBABABA });

  const boxWidth = 1;
  const boxHeight = 1.6;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y-0.4, z)
  return cube
}


// create pin light
function createPinLight(x, y, z) {
  const color = 0xffd285;
  const intensity = 100;
  const light = new THREE.PointLight(color, intensity, 3);
  light.position.set(x, 0, z-0.1);
  return light
}

function displayObj(scene, x, z) {
  const pinLight = createPinLight(x, 0, z)
  const stander = createStander(x, 0, z)
  scene.add(pinLight)
  scene.add(stander)
}

// create first object
function createHeart() {
  const shape = new THREE.Shape();
  const x = -2.5;
  const y = -5;
  shape.moveTo(x + 2.5, y + 2.5);
  shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
  shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
  shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
  shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
  shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
  shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

  const extrudeSettings = {
    steps: 2,
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 1,
    bevelSegments: 2,
  };

  const heartObj = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, extrudeSettings),
    new THREE.MeshPhongMaterial({ color: 0xFF007F })
  );

  heartObj.rotateZ(Math.PI)
  heartObj.scale.set(0.07, 0.07)
  return heartObj
}

const firstObj = createHeart()
firstObj.position.set(-4.4, 1.2 , 0.2)
scene.add(firstObj)
displayObj(scene, -4.4, 0.2)


// create second object
function createDonut() {
  const radius = 0.3;
  const tubeRadius = 0.2;
  const radialSegments = 8;
  const tubularSegments = 24;
  const geometry = new THREE.TorusGeometry(
    radius, tubeRadius,
    radialSegments, tubularSegments);

  const donutObj = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({ color: 0xaaf0d1 })
  )
  return donutObj
}

const secondObj = createDonut()
secondObj.position.set(0, 1.2, 0)
scene.add(secondObj)
displayObj(scene, 0, 0.2)

// creat third object
function createKnot() {
  const radius = 0.3;
  const tubeRadius = 0.1;
  const radialSegments = 8;
  const tubularSegments = 64;
  const p = 2;
  const q = 3;
  const geometry = new THREE.TorusKnotGeometry(
    radius, tubeRadius, tubularSegments, radialSegments, p, q);
  const knotObj = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({ color: 0x563887 })
  )
  return knotObj
}

const thirdObj = createKnot()
thirdObj.position.set(4.4, 1.2, 0.2)
scene.add(thirdObj)
displayObj(scene, 4.4, 0.2)

const objects = [firstObj, secondObj, thirdObj]
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// render
function resizeRendererToDisplaySize(renderer, camera) {
  const canvas = renderer.domElement;

  const pixelRatio = window.devicePixelRatio;

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

  objects.forEach((obj, ndx) => {
    const speed = (ndx+1) * .2;
    const rot = time * speed;
    obj.rotation.x = rot;
    obj.rotation.y = rot;
  });

  resizeRendererToDisplaySize(renderer, camera)
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
