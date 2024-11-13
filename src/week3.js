// https://threejs.org/manual/#ko/scenegraph
import * as THREE from 'three';
import './week2.css';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


function main() {
  // creaate canvas
  const canvas = document.createElement("canvas")

  canvas.setAttribute("id", "threejs-canvas")
  document.body.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const camera = new THREE.PerspectiveCamera(
    40, window.clientWidth / window.clientHeight, 0.1, 1000);
  // NOTE : 흔히 아는 x,y 축으로 카메라 설정. 
  camera.position.set(0, 0, 50);
  camera.up.set(0, 1, 0); // 카메라 시점에서 위쪽 방향을 y + 로 둠.
  camera.lookAt(0, 0, 0);
  
  const scene = new THREE.Scene();

  // 태양과 위치가 같아 태양 오브젝트에서 빛을 비추는 느낌을 줄 수 있음.
  const light = new THREE.PointLight(0xFFFFFF, 500);
  scene.add(light); 

  // an array of objects who's rotation to update
  const objects = [];
  const solarSystem = new THREE.Object3D();
  scene.add(solarSystem);
  objects.push(solarSystem);

  const sphereGeometry = new THREE.SphereGeometry(1, 6, 6);

  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xFFFF00 });
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(5, 5, 5);
  solarSystem.add(sunMesh); 
  // NOTE solar system 도 회전중이기 때문에, sun mesh 도 회전시키게되면 팽이마냥 빨리돈다
  // 태양이 0.0.0 에 위치하기 때문에 태양자체는 회전시키지 않겠음
  // objects.push(sunMesh);

  const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233FF, emissive: 0x112244 });
  const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
  earthMesh.position.x = 10;

  solarSystem.add(earthMesh); // 솔라시스템 회전에 영향받아 공전 
  objects.push(earthMesh); // 자기 자신의 회전으로 자전

  const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonMesh.scale.set(.5, .5, .5);
  moonMesh.position.x = 2
  earthMesh.add(moonMesh);
  objects.push(moonMesh);

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

  /*
   * 축과 격자를 동시에 켜고 끕니다
   * lil-gui가 체크박스를 만들게 하려면 boolean 타입의
   * 속성을 지정해줘야 하므로, `visible` 속성에
   * getter와 setter를 지정해 lil-gui가 이 속성을
   * 바라보도록 합니다
   */
  const gui = new GUI();
  class AxisGridHelper {
    constructor(node, units = 10) {
      const axes = new THREE.AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 2;  // 격자 다음에 렌더링
      node.add(axes);

      const grid = new THREE.GridHelper(units, units);
      grid.material.depthTest = false;
      grid.renderOrder = 1;
      node.add(grid);

      this.grid = grid;
      this.axes = axes;
      this.visible = false; // 체크박스를 끄겠단 소리
    }
    get visible() {
      return this._visible;
    }
    set visible(v) {
      this._visible = v;
      this.grid.visible = v;
      this.axes.visible = v;
    }
  }

  function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, 'visible').name(label);
  }
  makeAxisGrid(solarSystem, 'solarSystem', 25);
  makeAxisGrid(sunMesh, 'sunMesh');
  makeAxisGrid(earthMesh, 'earthMesh');
  makeAxisGrid(moonMesh, 'moonMesh');

  function render(time) {

    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    objects.forEach((obj) => {
      // NOTE 공식문서에서와 다르게 카메라가 바라보는 방향이 달라, 로테이션 방향도 z축을 중심으로 돌도록함
      obj.rotation.z = time; 
      // const axes = new THREE.AxesHelper();
      // axes.material.depthTest = false;
      // axes.renderOrder = 1;
      // obj.add(axes);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
