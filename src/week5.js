import * as THREE from 'three';
import './week5.css'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {


  const canvas = document.createElement("canvas")
  canvas.setAttribute("id", "threejs-canvas")
  document.body.appendChild(canvas)
  
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 75;
  const aspect = window.clientWidth / 2 / window.clientHeight; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 20;

	const scene = new THREE.Scene();

	function addLight( ...pos ) {

    const color = 0xffffff;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( ...pos );
		scene.add( light );

	}
  const lightP = 10
  addLight(lightP, -lightP, 50 );
  addLight(-lightP, lightP, -50 );


  const container = new THREE.Object3D()
  scene.add(container)


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
    steps: 1,

    depth: 1.0,

    bevelEnabled: true,
    bevelThickness: 1.26,

    bevelSize: 2.59,

    bevelSegments: 4,

  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.scale(1, -1, 1);  // Y축 반전
  // Check if the geometry has an index (for indexed geometry)
  const positions = geometry.attributes.position.array;
  // const material = new THREE.MeshPhongMaterial({
  //   color: 0xff1537,
  //   side: THREE.DoubleSide,
  //   shininess: 100,
  // });

  const material = new THREE.MeshStandardMaterial({
    color: 0xff1537,
    side: THREE.DoubleSide,
    roughness: 0.4,
    metalness: 0.4
  });


  const cubes = []
  const cubePositions = []
  // Loop through the vertices in sets of 3 to access faces (triangles)
  for (let i = 0; i < positions.length; i += 9) {
    // Each face consists of three vertices (3 vertices = 9 values: 3 x 3 coordinates)
    const trianglePositions = [
      positions[i], positions[i + 1], positions[i + 2],
      positions[i + 3], positions[i + 4], positions[i + 5],
      positions[i + 6], positions[i + 7], positions[i + 8]
    ]
    cubePositions.push(new THREE.Vector3(...trianglePositions))

    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const positionAttribute = new THREE.BufferAttribute(new Float32Array(trianglePositions), positionNumComponents)
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positionAttribute);
    // 법선 벡터 재계산
    geometry.computeVertexNormals();  // 법선 벡터를 재계산

    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(trianglePositions), normalNumComponents)
    );
    const cube = new THREE.Mesh(geometry, material);

    cubes.push(cube);
    container.add(cube);
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

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; // 부드러운 동작
  controls.target.set(0, 0, 0); // 아래 큐브와 구의 중심지점을 기준으로 카메라가 움직임. 
  controls.update();
  // 필요한 변수들 설정
  const A = 0.7;  // 크기 변화의 범위 (최소값과 최대값 사이의 차이)
  const B = 2;    // 박동의 속도 (주파수)
  const D = 1;    // 기저 크기 (기본 크기)

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    const sizeFactor = A * Math.sin(B * time) + D;  // 심장박동 함수
    cubes.forEach((cube, index) => {
      const direction = new THREE.Vector3().subVectors(cubePositions[index], new THREE.Vector3(0, 0, 0)).normalize();
      const moveDirection = sizeFactor >= D ? 1 : -1;
      const newPosition = direction.clone().multiplyScalar(sizeFactor * moveDirection); 
      const dampingFactor = 0.01;
      cube.position.lerp(newPosition, dampingFactor);

    });

    container.rotation.y = Math.sin( time) * 0.2 ;   
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);


}

main();
