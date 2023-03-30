<template>
  <div>
    <div ref="startDom"></div>
    <!-- <div class="menuControl">
      <el-tree :data="menuData" @node-click="handleNodeClick" />
    </div> -->
    <div class="modelType">
      <el-select
        v-model="value"
        class="m-2"
        placeholder="模型类型"
        size="large"
        @change="handleTypeSelect"
      >
        <el-option
          v-for="item in modelTypes"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script lang="ts">
interface Tree {
  label: string;
  children?: Tree[];
}

import * as THREE from "three";
import { ref, App } from "vue";
import { Watch } from "vue-property-decorator";
import { Options, Vue } from "vue-class-component";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// const OrbitControls = require("three-orbit-controls")(THREE);
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { XYZLoader } from "three/examples/jsm/loaders/XYZLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";

@Options({
  components: {},
})
export default class ModelFormat extends Vue {
  private modelTypes = [
    { value: "obj", label: "obj" },
    { value: "glb", label: "glb" },
    { value: "fbx", label: "fbx" },
    { value: "3ds", label: "3ds" },
    { value: "stl", label: "stl" },
    { value: "dae", label: "dae" },
  ];
  //   private value: any = ref("");
  private renderer: any = "";
  private stats: any = "";
  private scene: any = "";
  private camera: any = "";
  private ambientLight: any = "";
  private pointLight: any = "";
  private orbitControls: any = "";
  private curModelType: string = "";

  handleTypeSelect(val: string) {
    console.log(val);
    //选择模型和当前模型类型不一样时切换模型
    if (this.scene.getObjectByName(val)) return;
    // 找到当前模型
    let oldModel;
    this.modelTypes.forEach((ele, idx) => {
      if (this.scene.getObjectByName(ele.value)) {
        oldModel = this.scene.getObjectByName(ele.value);
      }
    });
    // 将当前模型从场景中移除
    if (oldModel) {
      this.scene.remove(oldModel);
    }
    //加载新模型
    switch (val) {
      case "obj":
        this.modelling();
        break;
      case "glb":
        this.glbModel();
        break;
      case "fbx":
        this.fbxModel();
        break;
      case "3ds":
        this.three_dsModel();
        break;
      case "stl":
        this.stlModel();
        break;
      case "dae":
        this.daeModel();
        break;
      default:
        break;
    }
    console.log(this.scene);
  }
  /**
   * dae模型
   */
  daeModel() {
    const loader = new ColladaLoader();
    loader.load("/model/collada/stormtrooper/stormtrooper.dae", (collada: any) => {
      const avatar = collada.scene;
      avatar.name = "dae";
      this.curModelType = avatar.name;
      this.scene.add(avatar);
    });
  }

  /**
   * stl模型
   */
  stlModel() {
    const loader = new STLLoader();
    const material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0x111111,
      shininess: 200,
    });

    loader.load("/model/stl/binary/pr2_head_pan.stl", (geometry) => {
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(0, -0.37, -0.6);
      mesh.rotation.set(-Math.PI / 2, 0, 0);
      mesh.scale.set(2, 2, 2);

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = "stl";
      this.curModelType = mesh.name;
      this.scene.add(mesh);
    });
  }

  /**
   * 3ds模型
   */
  three_dsModel() {
    const loader = new TDSLoader();
    loader.setResourcePath("/model/3ds/portalgun/textures/");
    loader.load("/model/3ds/portalgun/portalgun.3ds", (object) => {
      object.name = "3ds";
      this.curModelType = object.name;
      this.scene.add(object);
    });
  }

  /**
   * fbx模型
   */
  fbxModel() {
    const loader = new FBXLoader();
    loader.load("/model/fbx/Samba Dancing.fbx", (object) => {
      object.scale.set(0.01, 0.01, 0.01);
      object.name = "fbx";
      this.curModelType = object.name;
      this.scene.add(object);
    });
  }

  /**
   * glb模型
   */
  glbModel() {
    // 压缩glb模型,加载更快
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/js/libs/draco/gltf/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load("/model/gltf/LittlestTokyo.glb", (gltf) => {
      const model = gltf.scene;
      model.position.set(1, 1, 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.name = "glb";
      this.curModelType = model.name;
      this.scene.add(model);
    });
  }

  /**
   * obj+mtl模型
   */
  modelling() {
    let manager = new THREE.LoadingManager();
    manager.addHandler(/\.dds$/i, new DDSLoader());
    const objLoader = new OBJLoader(manager);
    const mtlLoader = new MTLLoader(manager).setPath("/model/little-room/ArcadeRoom_V1/");
    mtlLoader.load("ArcadeRoom_V1.mtl", (mtl: any) => {
      //obj模型对应材质
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load("/model/little-room/ArcadeRoom_V1/ArcadeRoom_V1.obj", (obj: any) => {
        obj.scale.set(1, 1, 1);
        obj.position.set(0, -1.5, 0);

        obj.name = "obj";
        this.curModelType = obj.name;
        this.scene.add(obj);
      });
    });
  }

  mounted() {
    this.init();
    this.animate();
  }

  /**
   * 初始化
   */
  init() {
    this.statsInit();
    this.rendererInit();
    this.sceneInit();
    this.lightInit();
    this.cameraInit();
    this.findModelToDrag();
    this.controlInit();
    this.modelling();
    window.addEventListener("resize", this.onWindowResize);
  }

  private ac: any = "";

  /**
   * 根据射线经过的group找到模型并开启拖拽事件
   */
  findModelToDrag() {
    let _this = this;
    this.renderer.domElement.addEventListener("mousedown", function (e: MouseEvent) {
      console.log(_this.curModelType);

      let raycaster = _this.screenToWorld(e.clientX, e.clientY);
      let intersect = raycaster.intersectObjects(
        _this.scene.getObjectByName(_this.curModelType).children
      );
      if (intersect.length > 0) {
        _this.ac = intersect[0].object;
        console.log(_this.ac);
        if (!_this.ac) return;
      }
    });
    this.renderer.domElement.addEventListener("mouseup", function (e: MouseEvent) {
      if (_this.ac) {
        _this.ac = false;
      }
    });
  }

  /**
   *场景世界坐标转平面二维坐标
   * @param offsetX 鼠标相对于画布左上角横向坐标
   * @param offsetY 鼠标相对于画布左上角纵向坐标
   * @returns {Raycaster|Raycaster}
   */
  screenToWorld(offsetX: number, offsetY: number) {
    let x = (offsetX / window.innerWidth) * 2 - 1,
      y = -(offsetY / window.innerHeight) * 2 + 1;
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    return raycaster;
  }

  /**
   * 初始化渲染器
   */
  rendererInit() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    (this.$refs.startDom as HTMLElement).appendChild(this.renderer.domElement);
  }

  /**
   * 窗口变化自适应
   */
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 监测FPS
   */
  statsInit() {
    this.stats = new (Stats as any)();
    // 0为监测帧率(FPS), 1为监测渲染时间(MS) 2为监测内存(MB)
    this.stats.setMode(0);
    // this.stats.showPanel(1);
    let statsDom = this.stats.domElement as HTMLElement;
    (this.$refs.startDom as HTMLElement).appendChild(statsDom);
    statsDom.style.left = "initial";
    statsDom.style.right = "0px";
  }

  /**
   * 初始化场景 并向场景添加光源和辅助坐标系
   */
  sceneInit() {
    this.scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.background = new THREE.Color(0xbfe3dd);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.5).texture;
    var axisHelper = new THREE.AxesHelper(1000);
    this.scene.add(axisHelper);
  }

  /**
   * 初始化灯光
   */
  lightInit() {
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    // this.pointLight = new THREE.PointLight(0xffffff, 2, 80);
    // this.pointLight.position.set(0, 10, 0);
    // const sphereSize = 1;
    // const pointLightHelper = new THREE.PointLightHelper(this.pointLight, sphereSize);
    // this.scene.add(this.pointLight, pointLightHelper, this.ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, 20, 0);
    const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    this.scene.add(this.ambientLight, directionalLight, helper);
  }

  /**
   * 初始化相机
   */
  cameraInit() {
    var k = window.innerWidth / window.innerHeight;
    var fov = 45; //三维场景显示范围控制系数，系数越大，显示的范围越大
    this.camera = new THREE.PerspectiveCamera(fov, k, 0.01, 2000);
    this.camera.position.set(8, 4, 9);
  }

  /**
   * 初始化控制器
   */
  controlInit() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.$refs.startDom as HTMLElement
    );
    this.orbitControls.dampingFactor = 0.2; //惯性大小
    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = 1.5;
    this.orbitControls.enableKeys = true;
    this.orbitControls.screenSpacePanning = false;
    this.orbitControls.target.set(0, 0, 0);
    this.orbitControls.maxZoom = Infinity;
    this.orbitControls.keys = {
      LEFT: "KeyA", //ArrowLeft
      UP: "KeyW", //ArrowUp
      RIGHT: "KeyD", //ArrowRight
      BOTTOM: "KeyS", //ArrowDown
    };
    //解决键盘控制失效问题
    this.orbitControls.listenToKeyEvents(window);
  }

  /**
   * 渲染
   */
  animate() {
    requestAnimationFrame(this.animate);
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  // 更新控件
  update() {
    this.orbitControls.update();
    this.stats.update();
  }
}
</script>

<style lang="less" scoped>
.menuControl {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  .el-tree {
    background: rgba(255, 255, 255, 0.7);
    width: 200px;
    height: 350px;
    border-radius: 0 5px 5px 0;
    --el-tree-expand-icon-color: #000000;
    --el-tree-text-color: #2a2a2a;
    overflow: scroll;
    /deep/ .el-tree-node__content {
      height: 35px;
    }
  }

  .el-tree::-webkit-scrollbar {
    width: 0 !important;
  }
}
.modelType {
  position: absolute;
  left: 10px;
  top: 10px;
}
</style>
