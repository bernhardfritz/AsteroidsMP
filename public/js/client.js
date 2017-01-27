var renderer = new THREE.WebGLRenderer();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
var stats = new Stats();
var MyObject = function() {
  this.myFirstField = 'helloworld';
  this.mySecondField = 1.0;
  this.myThirdField = true;
  this.myFourthField = function() {
    window.alert('foo');
  };
};
window.onload = function() {
  var foo = new MyObject();
  var gui = new dat.GUI();
  gui.add(foo, 'myFirstField');
  gui.add(foo, 'mySecondField', -5, 5);
  gui.add(foo, 'myThirdField');
  gui.add(foo, 'myFourthField');
};

init();
animate();

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  //Create a WebGLRenderer and turn on shadows in the renderer
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  //Create a DirectionalLight and turn on shadows for the light
  var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
  light.position.set( 0, 1, 0 ); 			//default; light shining from top
  light.castShadow = true;            // default false
  scene.add( light );

  //Set up shadow properties for the light
  light.shadow.mapSize.width = 512;  // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5;       // default
  light.shadow.camera.far = 500;      // default

  //Create a sphere that cast shadows (but does not receive them)
  var sphereGeometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
  var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
  var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
  sphere.castShadow = true; //default is false
  sphere.receiveShadow = false; //default
  scene.add( sphere );

  //Create a plane that receives shadows (but does not cast them)
  var planeGeometry = new THREE.PlaneBufferGeometry( 20, 20, 32, 32 );
  var planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.receiveShadow = true;
  scene.add( plane );
}

function animate() {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
}
