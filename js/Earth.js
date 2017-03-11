module.exports = class Earth {
  constructor() {
    this.earthGeometry   = new THREE.SphereGeometry(100, 32, 32);
    this.earthMaterial  = {};
    this.earthMesh = {};
    this.cloudGeometry = new THREE.SphereGeometry(101, 32, 32);
    this.cloudMaterial = {};
    this.cloudMesh = {};
  }

  init(scene) {
    this.earthMaterial = new THREE.MeshPhongMaterial({
      shininess: 1,
      map: THREE.ImageUtils.loadTexture('textures/Color Map.jpg'),
      bumpMap: THREE.ImageUtils.loadTexture('textures/Bump.jpg'),
      bumpScale: 0.45,
      specularMap: THREE.ImageUtils.loadTexture('textures/Spec Mask.png'),
      specular: new THREE.Color('grey')
    });
    this.earthMesh = new THREE.Mesh(this.earthGeometry, this.earthMaterial);

    this.cloudMaterial = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('textures/Clouds.png'),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite : false,
    });
    this.cloudMesh = new THREE.Mesh(this.cloudGeometry, this.cloudMaterial);

    this.earthMesh.add(this.cloudMesh);
    this.earthMesh.position.z -= 525;
    scene.add(this.earthMesh);
  }

  animate(delta) {
    this.earthMesh.rotation.y += 1/2 * delta;
    this.cloudMesh.rotation.y += 1/1 * delta;
  }
};
