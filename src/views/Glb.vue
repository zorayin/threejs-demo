<template>
  <div id="container"></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { transformControls } from "three/examples/jsm/controls/TransformControls";
import intersectObjects from "intersect-objects";
// import transformControls from "three-transformcontrols";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";

let mesh;
let scene;
export default {
  data() {
    return {
      camera: null,
      renderer: null,
      ambientLight: null,
      pointLight: null,
      mouseControls: null,
      onDownPosition: null,
      onUpPosition: null,
      firstPersonControls: null,
      clock: null,
      publicPath: process.env.BASE_URL,
    };
  },
  methods: {
    init() {
      const container = document.getElementById("container");
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(6, 1, 0.1, 1000);
      this.camera.position.set(0, 0, 10);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(this.renderer.domElement);
    },
    // 创建全景背景
    createPanoramicBj() {
      const geometry = new THREE.SphereGeometry(10000, 100, 100);
      const material = new THREE.MeshBasicMaterial({
        // map:new THREE.TextureLoader().load(...);//导入图片纹理
        color: 0xffffff,
        side: THREE.BackSide,
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
    },
    // 创建鼠标控制器
    createOrbitControls() {
      //没有缩放阻力
      this.mouseControls = new OrbitControls(this.camera, this.renderer.domElement); //创建控件对象
      this.mouseControls.enablePan = true; //右键平移拖拽
      this.mouseControls.enableZoom = true; //鼠标缩放
      this.mouseControls.minDistance = 0; //相机距离原点的距离范围
      this.mouseControls.maxDistance = 100;
      this.mouseControls.enableDamping = true; //滑动阻力
      this.mouseControls.dampingFactor = 0.1; //(默认.25)
      this.mouseControls.maxPolarAngle = (Math.PI / 4) * 3; //y旋转角度范围
      this.mouseControls.minPolarAngle = Math.PI / 4;
      // this.mouseControls.autoRotate = true; //自转(相机)
      // this.mouseControls.autoRotateSpeed = 5; //自转速度
    },
    //创建光源
    createLight() {
      this.ambientLight = new THREE.AmbientLight(0xffffff); //设置环境光
      this.ambientLight.name = "环境光";
      this.scene.add(this.ambientLight); //将环境光添加到场景中
      //   this.pointLight = new THREE.PointLight(0xffffff, 0.5, 0);
      //   this.pointLight.position.set(10, 10, 0); //设置点光源位置
      //   this.scene.add(this.pointLight); //将点光源添加至场景

      // 创建点光源
      const spotLight = new THREE.SpotLight(0x0c0c0c);
      //   创建颜色对象
      const color = new THREE.Color(0xac6c20);
      spotLight.color = color;
      spotLight.intensity = 2; //强度

      // 点光源颜色更新
      // this.pointLight.color=new THREE.Color(...)

      spotLight.position.set(10, 10, 0);
      spotLight.angle = Math.PI / 6;
      spotLight.penumbra = 1;
      spotLight.name = "聚光灯";
      this.scene.add(spotLight);
    },
    //加载模型
    loadModel() {
      let loader = new GLTFLoader();
      //此路径是相当对于public中index.html的，模型必须放在public路径下
      loader.load("/model/shapes.glb", (gltf) => {
        console.log(gltf);
        gltf.scene.position.set(0, 0, 0);
        // const mesh = new THREE.Mesh(gltf.scene);
        this.scene.add(gltf.scene);
      });

      // const loader = new GLTFLoader();
      // const path = "/model/shapes.glb";
      // loader.load(
      //   path,
      //   (gltf) => {
      //     gltf.scene.name = path;
      //     const box = new THREE.Box3();
      //     box.setFromObject(gltf.scene);
      //     const helper = new THREE.Box3Helper(box, 0xffff00);
      //     gltf.scene.attach(helper);
      //     intersectObjects(gltf.scene);
      //     //   transformControls(gltf.scene);
      //     this.scene.add(gltf.scene);
      //   },
      //   undefined,
      //   (error) => {
      //     console.log(error);
      //   }
      // );
    },

    //重复渲染
    repeatRender() {
      //请求动画帧，屏幕每刷新一次调用一次，绑定屏幕刷新频率
      requestAnimationFrame(this.repeatRender);
      this.mouseControls.update(); //实时更新轨道控制
      //   this.cube.rotation.y += 0.01; //以y为轴心的旋转角度每帧自加0.01+
      this.renderer.render(this.scene, this.camera); //将场景和相机进行渲染
    },
  },
  mounted() {
    this.init();
    this.createPanoramicBj();
    this.createOrbitControls();
    this.createLight();
    this.loadModel();
    this.repeatRender();
  },
};
</script>

<style lang="less" scoped>
#container {
  width: 100vw;
  height: 100vh;
}
</style>
