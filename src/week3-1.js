import * as THREE from 'three';
import './week3-1.css';

function main() {
  const canvas = document.createElement("canvas")

  canvas.setAttribute("id", "c")
  document.body.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setClearColor(0xAAAAAA);
  renderer.shadowMap.enabled = true;

  function makeCamera(fov = 40) {

    const aspect = 2; // the canvas default
    const zNear = 0.1;
    const zFar = 1000;
    return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);

  }

  const camera = makeCamera();
  camera.position.set(8, 4, 10).multiplyScalar(3);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  {

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 20, 0);
    scene.add(light);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    const d = 50;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 50;
    light.shadow.bias = 0.001;

  }

  {

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(1, 2, 4);
    scene.add(light);

  }

  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xCC8866 }); // 이래야 그림자가 바닥에 비춘다
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = Math.PI * - .5;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const carWidth = 4;
  const carHeight = 1;
  const carLength = 8;

  const tank = new THREE.Object3D();
  scene.add(tank);

  const bodyGeometry = new THREE.BoxGeometry(carWidth, carHeight, carLength);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x6688AA });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.position.y = 1.4;
  bodyMesh.castShadow = true;
  tank.add(bodyMesh);

  const tankCameraFov = 75;
  const tankCamera = makeCamera(tankCameraFov);
  tankCamera.position.y = 3;
  tankCamera.position.z = - 6;
  tankCamera.rotation.y = Math.PI;
  bodyMesh.add(tankCamera);

  const wheelRadius = 1; //car height 와 같음
  const wheelThickness = .5;
  const wheelSegments = 6;
  const wheelGeometry = new THREE.CylinderGeometry(
    wheelRadius, // top radius
    wheelRadius, // bottom radius
    wheelThickness, // height of cylinder
    wheelSegments);
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
  // 차에 속하기 때문에, 차의 상대적인 위치라는 걸 고려해 설정
  const wheelHeight = - carHeight / 2
  const frontWheelZ = carLength / 3
  const leftWheelX = - carWidth / 2 - wheelThickness / 2
  const rightWheelX = carWidth / 2 + wheelThickness / 2
  const wheelPositions = [
    [leftWheelX, wheelHeight, frontWheelZ], // 왼쪽 1
    [rightWheelX, wheelHeight, frontWheelZ], // 오른쪽 1
    [leftWheelX, wheelHeight, 0], // 왼쪽2
    [rightWheelX, wheelHeight, 0], // 오른쪽 2
    [leftWheelX, wheelHeight, - frontWheelZ], // 왼쪽 3
    [rightWheelX, wheelHeight, - frontWheelZ], // 오른쪽 3
  ];
  const wheelMeshes = wheelPositions.map((position) => {

    const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    mesh.position.set(...position);
    mesh.rotation.z = Math.PI * .5; // z 축이 90도 회전
    mesh.castShadow = true;
    bodyMesh.add(mesh);
    return mesh;

  });

  const domeRadius = 2;
  const domeWidthSubdivisions = 12;
  const domeHeightSubdivisions = 12;
  const domePhiStart = 0; // horizontal
  const domePhiEnd = Math.PI * 2; 
  const domeThetaStart = 0; //vertical
  const domeThetaEnd = Math.PI * .5;
  const domeGeometry = new THREE.SphereGeometry(
    domeRadius, domeWidthSubdivisions, domeHeightSubdivisions,
    domePhiStart, domePhiEnd, domeThetaStart, domeThetaEnd);
  const domeMesh = new THREE.Mesh(domeGeometry, bodyMaterial);
  domeMesh.castShadow = true;
  bodyMesh.add(domeMesh);
  domeMesh.position.y = .5; // 탱크몸체 바로 위로 와야하기 때문에

  const turretWidth = .1;
  const turretHeight = .1;
  const turretLength = carLength * .75 * .2;
  const turretGeometry = new THREE.BoxGeometry(
    turretWidth, turretHeight, turretLength);
  const turretMesh = new THREE.Mesh(turretGeometry, bodyMaterial);
  const turretPivot = new THREE.Object3D(); // ?
  turretMesh.castShadow = true;
  turretPivot.scale.set(5, 5, 5);
  turretPivot.position.y = 1; // 탱크 몸체 바로 위로 오도록 변경함
  turretMesh.position.z = turretLength * .5; // 뚜렛이 돔으로 부터 얼마나 길게 뽑혀나왔는지
  turretPivot.add(turretMesh);
  bodyMesh.add(turretPivot);
  // body > turretPivot > turretMesh
  // Pivot 을 굳이 둔 이유는 turretGeometry 를 직접조종하기보다 그 공간을 조정하려고 해서인듯

  const turretCamera = makeCamera();
  turretCamera.position.y = .75 * .2; // turret 겹쳐서 살짝 위에서 보려구하는 것 같음
  turretMesh.add(turretCamera);

  const targetGeometry = new THREE.SphereGeometry(.5, 6, 3);
  const targetMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00, flatShading: true });
  const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
  const targetOrbit = new THREE.Object3D();
  const targetElevation = new THREE.Object3D();
  const targetBob = new THREE.Object3D();
  targetMesh.castShadow = true;
  scene.add(targetOrbit);
  targetOrbit.add(targetElevation);
  targetElevation.position.z = carLength * 2;
  targetElevation.position.y = 8;
  targetElevation.add(targetBob);
  targetBob.add(targetMesh);
  // scene > targetOrbit > targetElevation > targetBob > targetMesh | (targetCameraPivot > targetCamera)

  const targetCamera = makeCamera();
  const targetCameraPivot = new THREE.Object3D();
  targetCamera.position.y = 1;
  targetCamera.position.z = - 2;
  targetCamera.rotation.y = Math.PI;
  targetBob.add(targetCameraPivot);
  targetCameraPivot.add(targetCamera);

  // Create a sine-like wave
  // 탱크가 가는 길
  const curve = new THREE.SplineCurve([
    new THREE.Vector2(- 10, 0),
    new THREE.Vector2(- 5, 5),
    new THREE.Vector2(0, 0),
    new THREE.Vector2(5, - 5),
    new THREE.Vector2(10, 0),
    new THREE.Vector2(5, 10),
    new THREE.Vector2(- 5, 10),
    new THREE.Vector2(- 10, - 10),
    new THREE.Vector2(- 15, - 8),
    new THREE.Vector2(- 10, 0),
  ]);

  // 시각화
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const splineObject = new THREE.Line(geometry, material);
  splineObject.rotation.x = Math.PI * .5; // 땅에 평행해야하기 때문에 x 축기준으로 90도
  splineObject.position.y = 0.05; // 살짝 위로 나옴
  scene.add(splineObject);

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

  const targetPosition = new THREE.Vector3();
  const tankPosition = new THREE.Vector2();
  const tankTarget = new THREE.Vector2();

  const cameras = [
    { cam: camera, desc: 'detached camera', },
    { cam: turretCamera, desc: 'on turret looking at target', },
    { cam: targetCamera, desc: 'near target looking at tank', },
    { cam: tankCamera, desc: 'above back of tank', },
  ];

  const infoElem = document.createElement("div")

  infoElem.setAttribute("id", "info")
  document.body.appendChild(infoElem)

  function render(time) {

    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {

      const canvas = renderer.domElement;
      cameras.forEach((cameraInfo) => {

        const camera = cameraInfo.cam;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

      });

    }

    // move target
    targetOrbit.rotation.y = time * .27; 
    targetBob.position.y = Math.sin(time * 2) * 4;  // 위아래로 사인파동을 그리며 움직임
    // target 자체 회전
    targetMesh.rotation.x = time * 7; 
    targetMesh.rotation.y = time * 13;
    targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
    targetMaterial.color.setHSL(time * 10 % 1, 1, .25);

    // move tank
    const tankTime = time * .05;
    curve.getPointAt(tankTime % 1, tankPosition); // 탱크 위치
    curve.getPointAt((tankTime + 0.01) % 1, tankTarget); // 타겟은 탱크보다 살짝 앞서게
    tank.position.set(tankPosition.x, 0, tankPosition.y);
    tank.lookAt(tankTarget.x, 0, tankTarget.y);

    // face turret at target
    // NOTE targetMesh 의 월드 좌표계에서의 위치를 targetPosition이라는 Vector3 객체에 저장함
    targetMesh.getWorldPosition(targetPosition);  
    turretPivot.lookAt(targetPosition);

    // make the turretCamera look at target
    turretCamera.lookAt(targetPosition);

    // make the targetCameraPivot look at the at the tank
    tank.getWorldPosition(targetPosition);
    targetCameraPivot.lookAt(targetPosition);

    wheelMeshes.forEach((obj) => {

      obj.rotation.x = time * 3;

    });

    const camera = cameras[time * .25 % cameras.length | 0];
    infoElem.textContent = camera.desc;

    renderer.render(scene, camera.cam);

    requestAnimationFrame(render);

  }

  requestAnimationFrame(render);

}

main();
