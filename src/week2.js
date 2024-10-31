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
const aspect = 1;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 1.6, 8)

// create scene
const scene = new THREE.Scene();

// create light
const color = 0xFFFFFF;
const intensity = 2;
const light = new THREE.AmbientLight(color, intensity);
light.position.set(0, 0, 80);
scene.add(light);

// stand front wall
function rotateWall(mesh, x, y, z) {
  mesh.rotateX(x)
  mesh.rotateY(y)
  mesh.rotateZ(z)
}

const wallInfo = { w: 800, h: 400, x: 0, y: 0, z: -40, rot: [0, 0, 0] }
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x5C5A51 });
const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(wallInfo.w, wallInfo.h),
  wallMaterial
)

wall.position.set(wallInfo.x, wallInfo.y, wallInfo.z)
rotateWall(wall, ...wallInfo.rot)
scene.add(wall)

const floorGeometry = new THREE.BoxGeometry(800, 0.3, 100);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x5C5A51 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -1.2, 48)
scene.add(floor)

// create standar
function createStander(x,y,z) {
  const material = new THREE.MeshPhongMaterial({ color: 0xBABABA });

  const boxWidth = 1;
  const boxHeight = 1.2;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y-0.1, z)
  return cube
}


// create pin light
function createPinLight(x, y, z) {
  const color = 0xffd285;
  const intensity = 100;
  // const light = new THREE.DirectionalLight(color, intensity);
  const light = new THREE.PointLight(color, intensity, 3);
  light.position.set(x, y, z);
  return light
}

function displayObj(scene, obj, x, z) {
  const pinLight = createPinLight(x, 4, z)
  const stander = createStander(x, 0, z)
  scene.add(pinLight)
  scene.add(stander)
  pinLight.target = obj
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
displayObj(scene, firstObj, -4.4, 0.2)


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
displayObj(scene, secondObj, 0, 0.2)

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
displayObj(scene, thirdObj, 4.4, 0.2)

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
