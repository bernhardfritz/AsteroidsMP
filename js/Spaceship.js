import Matter from 'matter-js';
import TWEEN from 'tween.js';

const left = 0b1000;
const right = 0b0100;
const up = 0b0010;
const down = 0b0001;

module.exports = class Spaceship {
  constructor() {
    this.obj = {};
    this.material = new THREE.MeshPhongMaterial();
    this.body = {};
    this.commonThrusterOptions = {};
    this.leftThrusterRelativePosition = new THREE.Vector3(-7.6, 3.16, 3.3);
    this.leftThrusterOptions = {};
    this.leftThrusterLight = new THREE.PointLight(0xfc7b21, 0, 100);
    this.leftTween = undefined;
    this.rightThrusterRelativePosition = new THREE.Vector3(-7.6, -3.16, 3.3);
    this.rightThrusterOptions = {};
    this.rightThrusterLight = new THREE.PointLight(0xfc7b21, 0, 100);
    this.rightTween = undefined;
    this.options = {
      angleFactor: 0.02,
      forceFactor: 0.2
    };
    this.state = 0b0000; // left up right down
  }

  init(scene, objLoader, textureLoader, engine) {
    objLoader.load('models/Arc170.obj', function(group) {
      this.material.map = textureLoader.load("textures/ARC170_TXT_VERSION_4_D.png");
      this.material.specularMap = textureLoader.load("textures/ARC170_TXT_VERSION_4_S.png");
      this.material.normalMap = textureLoader.load("textures/ARC170_TXT_VERSION_4_N.png");

      group.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          child.material = this.material;
          child.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
          child.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
        }
      }.bind(this));
      let box = new THREE.Box3().setFromObject(group);
      this.body = Matter.Bodies.rectangle(0, 0, box.max.x - box.min.x, box.max.y - box.min.y);
      Matter.World.add(engine.world, this.body);
      let factor = 10.0 / box.max.x;
      group.scale.set(factor, factor, factor);
      this.obj = group;
      scene.add(this.obj);

      // let boxHelper = new THREE.BoxHelper(this.obj);
      // scene.add(boxHelper);
    }.bind(this));

    this.commonThrusterOptions.positionRandomness = 0.3;
    this.commonThrusterOptions.velocity = new THREE.Vector3();
    this.commonThrusterOptions.velocityRandomness = 0.5;
    this.commonThrusterOptions.color = 0xfc7b21;
    this.commonThrusterOptions.colorRandomness = 0.2;
    this.commonThrusterOptions.turbulence = 0.05;
    this.commonThrusterOptions.lifetime = 0.3;
    this.commonThrusterOptions.size = 2.5;
    this.commonThrusterOptions.sizeRandomness = 1;

    this.leftThrusterOptions.position = new THREE.Vector3(this.leftThrusterRelativePosition.x, this.leftThrusterRelativePosition.y, this.leftThrusterRelativePosition.z);
    this.rightThrusterOptions.position = new THREE.Vector3(this.rightThrusterRelativePosition.x, this.rightThrusterRelativePosition.y, this.rightThrusterRelativePosition.z);

    scene.add(this.leftThrusterLight);
    scene.add(this.rightThrusterLight);
  }

  initGui(gui) {
    let spaceshipFolder = gui.addFolder('spaceship');
    spaceshipFolder.add(this.options, 'angleFactor', 0, 1).step(0.001);
    spaceshipFolder.add(this.options, 'forceFactor', 0, 1).step(0.001);
    let commonThrusterOptionsFolder = spaceshipFolder.addFolder('commonThrusterOptions');
    commonThrusterOptionsFolder.add(this.commonThrusterOptions, "velocityRandomness", 0, 3);
		commonThrusterOptionsFolder.add(this.commonThrusterOptions, "positionRandomness", 0, 3);
		commonThrusterOptionsFolder.add(this.commonThrusterOptions, "size", 1, 20);
		commonThrusterOptionsFolder.add(this.commonThrusterOptions, "sizeRandomness", 0, 25);
		commonThrusterOptionsFolder.add(this.commonThrusterOptions, "colorRandomness", 0, 1);
		commonThrusterOptionsFolder.add(this.commonThrusterOptions, "lifetime", 0.1, 10);
		commonThrusterOptionsFolder.add(this.commonThrusterOptions, "turbulence", 0, 1);
    commonThrusterOptionsFolder.addColor(this.commonThrusterOptions, "color").onChange(function(colorValue) {
      this.commonThrusterOptions.color = '0x'+colorValue.toString(16);
    }.bind(this));
  }

  animate(particleSystem, engine) {
    this.obj.rotation.z = this.body.angle;
    this.obj.position.set(
      this.body.position.x,
      this.body.position.y,
      this.obj.position.z
    );
    this.leftThrusterOptions.position.set(
      this.body.position.x + this.leftThrusterRelativePosition.x * Math.cos(this.body.angle) - this.leftThrusterRelativePosition.y * Math.sin(this.body.angle),
      this.body.position.y + this.leftThrusterRelativePosition.x * Math.sin(this.body.angle) + this.leftThrusterRelativePosition.y * Math.cos(this.body.angle),
      0 + this.leftThrusterRelativePosition.z
    );
    this.rightThrusterOptions.position.set(
      this.body.position.x + this.rightThrusterRelativePosition.x * Math.cos(this.body.angle) - this.rightThrusterRelativePosition.y * Math.sin(this.body.angle),
      this.body.position.y + this.rightThrusterRelativePosition.x * Math.sin(this.body.angle) + this.rightThrusterRelativePosition.y * Math.cos(this.body.angle),
      0 + this.rightThrusterRelativePosition.z
    );

    for (var k in this.commonThrusterOptions) {
      this.leftThrusterOptions[k] = this.commonThrusterOptions[k];
      this.rightThrusterOptions[k] = this.commonThrusterOptions[k];
    }

    this.leftThrusterLight.position.set(this.leftThrusterOptions.position.x, this.leftThrusterOptions.position.y, this.leftThrusterOptions.position.z);
    this.rightThrusterLight.position.set(this.rightThrusterOptions.position.x, this.rightThrusterOptions.position.y, this.rightThrusterOptions.position.z);

    this.leftThrusterLight.color.setHex(this.leftThrusterOptions.color);
    this.rightThrusterLight.color.setHex(this.rightThrusterOptions.color);

    let leftThrusterActive = this.state & up || this.state & right;
    let rightThrusterActive = this.state & up || this.state & left;

    if (leftThrusterActive) {
      particleSystem.spawnParticle(this.leftThrusterOptions);
      if (!this.leftTween) {
        this.leftTween = new TWEEN.Tween(this.leftThrusterLight).to({
          intensity: 3
        }, 150)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onStop(function() {
          this.leftTween = undefined;
          new TWEEN.Tween(this.leftThrusterLight).to({
            intensity: 0
          }, 150)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
        }.bind(this))
        .start();
      }
    } else {
      if (this.leftTween) {
        this.leftTween.stop();
      }
    }

    if (rightThrusterActive) {
      particleSystem.spawnParticle(this.rightThrusterOptions);
      if (!this.rightTween) {
        this.rightTween = new TWEEN.Tween(this.rightThrusterLight).to({
          intensity: 3
        }, 150)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onStop(function() {
          this.rightTween = undefined;
          new TWEEN.Tween(this.rightThrusterLight).to({
            intensity: 0
          }, 150)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
        }.bind(this))
        .start();
      }
    } else {
      if (this.rightTween) {
        this.rightTween.stop();
      }
    }
  }

  updateState(keyDown) {
    this.state = 0;
    if (keyDown[37]) { // left arrow key
      this.state = this.state | left;
    }
    if (keyDown[38]) { // up arrow key
      this.state = this.state | up;
    }
    if (keyDown[39]) { // right arrow key
      this.state = this.state | right;
    }
    if (keyDown[40]) { // down arrow key
      this.state = this.state | down;
    }
  }

  beforeUpdate() {
    if (this.state & left) {
      Matter.Body.rotate(this.body, Math.PI * this.options.angleFactor);
    }
    if (this.state & up) {
      Matter.Body.applyForce(this.body, this.body.position, {x: Math.cos(this.body.angle) * this.options.forceFactor, y: Math.sin(this.body.angle) * this.options.forceFactor});
    }
    if (this.state & right) {
      Matter.Body.rotate(this.body, - Math.PI * this.options.angleFactor);
    }
    if (this.state & down) {
      Matter.Body.applyForce(this.body, this.body.position, {x: -Math.cos(this.body.angle) * this.options.forceFactor, y: -Math.sin(this.body.angle) * this.options.forceFactor});
    }
  }
};
