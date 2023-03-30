<template>
  <div id="container"></div>
</template>

<script>
import * as THREE from "three";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

let mesh;
let scene;
export default {
  data() {
    return {
      publicPath: process.env.BASE_URL,
      camera: null,
      renderer: null,
      controls: null,
      clock: null,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    //  初始化
    init() {
      this.createScene();
      this.createLight();
      this.createCamera();
      this.createRender();
      this.loadObj();
      // this.createFlyControls();
      // this.createTrackballControls();
      this.createOrbitControls();
      this.render();
    },
    // 创建场景
    createScene() {
      this.scene = new THREE.Scene();
    },
    // 加载模型
    loadObj() {
      const gltfloader = new GLTFLoader();
      //此路径是相当对于public中index.html的，模型必须放在public路径下
      gltfloader.load("/model/shapes.glb", (gltf) => {
        console.log(gltf);
        gltf.scene.position.set(0, 0, 0);
        this.mesh = new THREE.Mesh(gltf.scene);
        this.scene.add(gltf.scene);
      });
    },
    // 创建光源
    createLight() {
      // 环境光
      const ambientLight = new THREE.AmbientLight(0x383838);
      this.scene.add(ambientLight);
      // 聚光灯
      const spotLight = new THREE.SpotLight(0xffffff);
      spotLight.intensity = 1.5;
      spotLight.angle = Math.PI / 6;
      spotLight.penumbra = 2;
      spotLight.position.set(200, 200, 200);
      spotLight.castShadow = true;
      this.scene.add(spotLight);
    },
    // 创建相机
    createCamera() {
      const element = document.getElementById("container");
      const width = element.clientWidth;
      const height = element.clientHeight;
      const k = width / height;
      this.camera = new THREE.PerspectiveCamera(35, k, 0.1, 1000);
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.scene.add(this.camera);
    },
    // 创建渲染器
    createRender() {
      const element = document.getElementById("container");
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(element.clientWidth, element.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.renderer.setClearColor(0xb9d3ff, 0.4);
      element.appendChild(this.renderer.domElement);
    },

    // 创建飞行控制器 第一人称
    createFlyControls() {
      this.clock = new THREE.Clock();
      this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);

      this.controls.dragToLook = true;
      // this.firstPersonControls.updateRotationVector();
      // this.firstPersonControls.moveState.rollLeft = 1;
      // this.firstPersonControls.autoForward = true;
      // this.firstPersonControls.movementSpeed = 0;
      // this.firstPersonControls.lookSpeed = 0.01; //鼠标移动查看的速度
      // this.firstPersonControls.movementSpeed = 1; //相机移动速度
      // this.firstPersonControls.noFly = false;
      // this.firstPersonControls.lookVertical = true;
      // // this.firstPersonControls.constrainVertical = true; //约束垂直
      // this.firstPersonControls.verticalMin = 1.0;
      // this.firstPersonControls.verticalMax = 2.0;
      // this.firstPersonControls.lon = -150; //进入初始视角x轴的角度
      // this.firstPersonControls.lat = 120; //初始视角进入后y轴的角度
    },

    // 创建轨迹球控制器
    createTrackballControls() {
      this.clock = new THREE.Clock();
      this.controls = new TrackballControls(this.camera, this.renderer.domElement);
      this.controls.enabled = true;
      this.controls.noPan = false; //禁止平移
      this.controls.noRotate = false; //旋转
      this.controls.noZoom = false; //平移
      this.controls.staticMoving = false;
    },

    // 创建轨道控制器
    createOrbitControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enabled = true;
      this.controls.target = new THREE.Vector3();
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05; //惯性大小

      // document.addEventListener('change',changeControls)
      // const element = document.getElementById("container");
      // window.addEventListener("keydown", (event) => {
      //   event.preventDefault();
      //   // console.log(event.code);
      //   switch (event.code) {
      //   }
      // });
      // element.addEventListener("keydown", (event) => {
      //   console.log(event.code);
      // });

      // window.addEventListener("change", (event) => {
      //   console.log(event.keycode);
      //   this.controls.enableKeys = true;
      //   this.controls.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
      //   this.controls.keyPanSpeed = 7; //键盘每次移动7px
      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };

      this.controls.keys = {
        LEFT: "ArrowLeft", //left arrow
        UP: "ArrowUp", // up arrow
        RIGHT: "ArrowRight", // right arrow
        BOTTOM: "ArrowDown", // down arrow
      };
      this.controls.addEventListener("change", this.refresh);

      // });
    },
    refresh() {
      this.renderer.render(this.scene, this.camera); //执行渲染操作
    },

    // 渲染
    render() {
      // const delta = this.clock.getDelta();
      // this.controls.update(delta);
      // this.controls.update();
      this.controls.update();

      requestAnimationFrame(this.render);
      this.renderer.render(this.scene, this.camera);
    },
  },
};
</script>

<style lang="less" scoped>
#container {
  width: 100vw;
  height: 100vh;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  overflow: hidden;
}
</style>
