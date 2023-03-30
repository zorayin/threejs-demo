<template>
  <div class="main" style="display: flex; flex-direction: column">
    <div class="controls">
      <el-slider
        style="position: absolute; width: 300px; left: 300px"
        controls-position="right"
        v-model="radio"
        :min="-100"
        :max="100"
        :step="1"
      ></el-slider>
      <div class="btn">
        <!-- <el-button
          @click="changeShape(index)"
          v-for="(item, index) in shape"
          :key="index"
          size="middle"
          >{{ item }}</el-button
        > -->
        <el-radio v-model="shape" label="arc">圆弧</el-radio>
        <el-radio v-model="shape" label="wave">波浪</el-radio>
      </div>
    </div>

    <div class="text-box">
      <div :style="borderStyle"></div>
      <!-- <span
        class="text"
        ref="text"
        v-for="(item, index) in splitTexts"
        :key="index"
        :style="textStyle(index)"
        >{{ item }}</span
      > -->

      <svg xmlns="http://www.w3.org/2000/svg" ref="svgText" x="0" y="0" :style="svgStyle">
        <defs>
          <path id="circle" :d="path" />
          <path id="line" :d="`M0 ${originWH.h} L ${originWH.w} ${originWH.h}`" />
        </defs>
        <g>
          <text ref="originText" v-if="!radio">
            {{ text }}
          </text>
          <text v-else ref="dynamic">
            <textPath
              v-bind:xlink:href="linkHref"
              :textLength="totalLength"
              ref="dynamicText"
            >
              {{ text }}
            </textPath>
          </text>
          <!-- <path :d="path" stroke="#33FFFFFF" stroke-width="1" fill="transparent" /> -->
        </g>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, App } from "vue";
import { Watch } from "vue-property-decorator";
import { Options, Vue } from "vue-class-component";

@Options({
  components: {},
})
export default class Circle extends Vue {
  private text: string = "右侧圆弧";
  private splitTexts: string[] = [];
  private originWH: { w: number; h: number } = { w: 0, h: 0 }; //整个字符串初始宽高
  private textCount: number = 0; //字符个数
  private singleTextWH: { w: number; h: number } = { w: 0, h: 0 }; //单个字符宽高
  private radio: number = 0; //弧度比例
  private radius: number = 0; //半径
  private path: string = ""; //圆弧路径
  private totalLength: number = 0;
  private shape: string = "arc";

  /**
   * 路径地址
   */
  get linkHref() {
    if (this.radio) {
      return "#circle";
    } else {
      return "#line";
    }
  }

  get borderStyle() {
    if (!this.radio) return;

    switch (this.shape) {
      case "arc":
        this.totalLength = this.originWH.w;
        this.calcArcCoordinate();
        break;
      case "wave":
        this.calcWaveCoordinate();
        break;
      default:
        break;
    }

    let dynamic = this.$refs.dynamic as SVGTextElement;
    // console.log(dynamic);
    if (!dynamic) return;
    const { width, height, x, y } = dynamic.getBoundingClientRect();

    // console.log(dynamic.getBoundingClientRect());
    return {
      border: `1px solid #000`,
      position: "absolute",
      width: `${width}px`,
      height: `${height}px`,
      left: `${x}px`,
      top: `${y}px`,
    };
  }

  get svgStyle() {
    return {
      position: "absolute",
      left: `${this.singleTextWH.w}`,
      top: `${this.singleTextWH.h}`,
      overflow: "visible",
    };
  }

  mounted() {
    this.splitTexts = this.text.split("");
    this.textCount = this.splitTexts.length;

    //计算初始字符串的宽高
    let originText = this.$refs.originText as SVGTextElement;
    const { width, height } = originText.getBoundingClientRect();
    this.originWH.w = width;
    this.originWH.h = height;
    this.totalLength = width;
    console.log(this.originWH);

    //计算单个字符的原始宽高
    this.singleTextWH.w = this.originWH.w / this.textCount;
    this.singleTextWH.h = this.originWH.h;

    console.log(this.singleTextWH);
  }

  /**
   * 计算圆弧坐标（波浪圆弧样式）
   * Deprecated
   */
  calcWaveCoordinateDeprecated() {
    let ratio = this.radio / 100;

    // 每段的角度
    let angle = Math.abs((ratio * 360) / 2);

    let referAngle = angle / 2;
    let referRadian = this.turnToRadian(referAngle);

    //内圆弧参数
    let insideLength = this.originWH.w / 2; //内圆弧长
    let insideRadius = (insideLength * 180) / (angle * Math.PI); //内圆半径
    let insideAngle = angle / 2; //内圆一半的圆心角(角度制)
    let insideRadian = this.turnToRadian(insideAngle); //内圆一半的圆心角(弧度制)
    let insideY = insideRadius * Math.cos(insideRadian);
    let insideX = insideRadius * Math.sin(insideRadian);

    //外圆弧参数
    let outsideRadius = insideRadius + this.singleTextWH.h; //外圆半径
    let outsideRadian = Math.acos(insideY / outsideRadius); //外圆一半的圆心角(弧度值)
    let outsideLength = 2 * outsideRadian * outsideRadius; //外圆弧长
    let outsideX = outsideRadius * Math.sin(outsideRadian);
    let outsideY = outsideRadius * Math.cos(outsideRadian);

    this.totalLength = insideLength + outsideLength; //总弧长

    if (ratio > 0) {
      // 计算贝塞尔曲线坐标
      // 起始点
      let startX = 0;
      let startY = insideRadius - insideY;

      //第一个控制点
      let controlsX = insideX;
      let controlsY = insideRadius / Math.cos(insideRadian) - insideRadius;

      //中点
      let centerX = insideX + outsideX;
      let centerY = startY;

      //终点
      let endX = 2 * centerX;
      let endY = startY;

      this.path = `M${startX} ${startY} Q${controlsX} ${controlsY} ${centerX} ${centerY} T${endX} ${endY}`;
    }
  }

  /**
   * 计算圆弧坐标（波浪圆弧样式）
   */
  calcWaveCoordinate() {
    let ratio = this.radio / 100;

    // 每段的角度
    let angle = Math.abs((ratio * 360) / 2);

    let referAngle = angle / 2;
    let referRadian = this.turnToRadian(referAngle);

    //内圆弧参数
    let leftRadian = this.originWH.w / 2;
    let leftRadius = (leftRadian * 180) / (angle * Math.PI);
    let insideY = leftRadius * Math.cos(referRadian);

    //外圆弧参数
    let rightRadius = leftRadius + this.singleTextWH.h;
    let outsideAngle = Math.acos(insideY / rightRadius); //注意这里得到的是弧度值
    console.log(outsideAngle, referRadian, angle);
    // let rightRadian = (angle * Math.PI * rightRadius) / 180;
    let rightRadian = outsideAngle * rightRadius;

    console.log(rightRadian, leftRadian);

    this.totalLength = leftRadian + 2 * rightRadian;

    // console.log(leftRadius, leftRadian);
    // console.log(rightRadius, rightRadian);

    if (ratio > 0) {
      //小于半圆的情况

      //左侧圆弧的起点坐标
      let startPointY = leftRadius - insideY;

      //左侧圆弧的终点坐标
      let endPointX = 2 * leftRadius * Math.sin(referRadian);
      let endPointY = startPointY;

      //右侧圆弧高
      let rightH = rightRadius - rightRadius * Math.cos(outsideAngle);
      //右侧圆弧弦长
      let rightW = 2 * rightRadius * Math.sin(outsideAngle);

      this.path = `M0 ${startPointY} A${leftRadius} ${leftRadius} 0 0 1 ${endPointX} ${endPointY} A${rightRadius} ${rightRadius} 0 0 0 ${
        endPointX + rightW
      } ${startPointY}`;

      // this.path = `M0,${startPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY} M${
      //   2 * endPointX
      // } ${endPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY}`;

      // this.path = `M0,${startPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY} L ${endPointX},${endPointY+this.singleTextWH.h} A${rightRadius},${rightRadius} 0 0,0 ${
      //   endPointX + rightW
      // } ${endPointY}`;

      // this.path = `M0,${startPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY} L ${endPointX},${
      //   endPointY + this.singleTextWH.h
      // } A${rightRadius},${rightRadius} 0 0,0 ${endPointX + rightW} ${endPointY}`;
    } else if (ratio < 0) {
      //反方向小于半圆的情况

      //左侧圆弧
      let leftY = rightRadius - rightRadius * Math.cos(outsideAngle);
      let leftX = 2 * rightRadius * Math.sin(outsideAngle);

      //右侧圆弧
      let rightX = 2 * leftRadius * Math.sin(referRadian);

      this.path = `M0 ${leftY} A${rightRadius} ${rightRadius} 0 0 0 ${leftX} ${leftY} A${leftRadius} ${leftRadius} 0 0 1 ${
        rightX + leftX
      } ${leftY}`;
    }
  }

  calcWaveCoordinate123() {
    let ratio = this.radio / 100;

    // 每段的角度
    let angle = Math.abs((ratio * 360) / 2);

    // let referAngle = angle / 2;
    // let referRadian = this.turnToRadian(referAngle);

    //内圆弧参数
    // let leftRadian = this.originWH.w / 2;
    // let leftRadius = (leftRadian * 180) / (angle * Math.PI);
    // let insideY = leftRadius * Math.cos(referRadian);
    let halfLength = this.originWH.w / 2;
    let radius = (halfLength * 180) / (angle * Math.PI); //平均半径
    console.log(radius);
    let radian = (angle * Math.PI * radius) / 180; //平均弧长

    let referAngle = angle / 2;
    let referRadian = this.turnToRadian(referAngle);

    let x = radius * Math.sin(referRadian);
    let y = radius * Math.cos(referRadian);

    //外圆弧参数
    // let rightRadius = leftRadius + this.singleTextWH.h;
    // let outsideAngle = Math.acos(insideY / rightRadius); //注意这里得到的是弧度值
    // console.log(outsideAngle, referRadian, angle);
    // // let rightRadian = (angle * Math.PI * rightRadius) / 180;
    // let rightRadian = outsideAngle * rightRadius;

    // console.log(rightRadian, leftRadian);

    // this.totalLength = leftRadian + 2 * rightRadian;
    this.totalLength = 2 * radian;
    console.log(this.totalLength);

    if (ratio > 0) {
      // //左侧圆弧的起点坐标
      // let startPointY = leftRadius - insideY;

      // //左侧圆弧的终点坐标
      // let endPointX = 2 * leftRadius * Math.sin(referRadian);
      // let endPointY = startPointY;

      // //右侧圆弧高
      // let rightH = rightRadius - rightRadius * Math.cos(outsideAngle);
      // //右侧圆弧弦长
      // let rightW = 2 * rightRadius * Math.sin(outsideAngle);

      this.path = `M0 ${y} A${radius} ${radius} 0 0 1 ${
        2 * x
      } ${y} A${radius} ${radius} 0 0 0 ${4 * x} ${y}`;

      // this.path = `M0,${startPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY} M${
      //   2 * endPointX
      // } ${endPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY}`;

      // this.path = `M0,${startPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY} L ${endPointX},${endPointY+this.singleTextWH.h} A${rightRadius},${rightRadius} 0 0,0 ${
      //   endPointX + rightW
      // } ${endPointY}`;

      // this.path = `M0,${startPointY} A${leftRadius},${leftRadius} 0 0,1 ${endPointX},${endPointY} L ${endPointX},${
      //   endPointY + this.singleTextWH.h
      // } A${rightRadius},${rightRadius} 0 0,0 ${endPointX + rightW} ${endPointY}`;
    } else if (ratio < 0) {
      //反方向小于半圆的情况
      // //左侧圆弧
      // let leftY = rightRadius - rightRadius * Math.cos(outsideAngle);
      // let leftX = 2 * rightRadius * Math.sin(outsideAngle);
      // //右侧圆弧
      // let rightX = 2 * leftRadius * Math.sin(referRadian);
      // this.path = `M0 ${leftY} A${rightRadius} ${rightRadius} 0 0 0 ${leftX} ${leftY} A${leftRadius} ${leftRadius} 0 0 1 ${
      //   rightX + leftX
      // } ${leftY}`;
    }
  }

  calcWaveCoordinate23() {
    let ratio = this.radio / 100;
    // 总弧长
    let total = this.originWH.w / ratio;
    // 角度
    let angle = (ratio * 360) / 2;
    // 半径 弧长公式 l = n * Π * r / 180;
    let radius = Math.abs(((this.originWH.w / 2) * 180) / (angle * Math.PI));
    let newRadius = radius + this.singleTextWH.h;

    this.totalLength = 300;

    this.radius = radius;

    console.log(radius, angle);

    if (this.radio > 0) {
      //小于半圆的情况

      let referAngle = Math.abs(angle / 2);
      let referRadian = this.turnToRadian(referAngle);
      //圆弧的起点坐标
      let startPointY = radius - radius * Math.cos(referRadian);

      //圆弧的终点坐标
      let endPointX = 2 * radius * Math.sin(referRadian);
      let endPointY = radius - radius * Math.cos(referRadian);

      let startPointX = newRadius * Math.sin(referRadian) * 2;

      console.log(endPointX, startPointX);

      this.path = `M0 ${startPointY} A${radius} ${radius} 0 0 1 ${endPointX} ${endPointY}  M${endPointX} ${startPointY} A${radius} ${radius} 0 0 0 ${
        endPointX + startPointX
      } ${endPointY}`;
    } else if (this.radio < 0) {
      //反方向小于半圆的情况
      radius += this.singleTextWH.h / 2;
      this.radius = radius;

      this.totalLength = (Math.abs(angle) * Math.PI * radius) / 180 + this.singleTextWH.h;

      let referAngle = Math.abs(angle) / 2;
      let referRadian = this.turnToRadian(referAngle);
      // let newRadius = Math.abs(radius);
      let startPointX = radius * Math.sin(referRadian) * 2;

      this.path = `M0 0 A${radius} ${radius} 0 0 0 ${startPointX} 0`;
    }
  }

  /**
   * 计算圆弧坐标（单个圆弧样式）
   */
  calcArcCoordinate() {
    let ratio = this.radio / 100;
    // 总弧长
    let total = this.originWH.w / ratio;
    // 角度
    let angle = ratio * 360;
    // 半径 弧长公式 l = n * Π * r / 180;
    let radius = Math.abs((this.originWH.w * 180) / (angle * Math.PI));
    this.radius = radius;

    console.log(radius, angle);

    // //圆弧两侧切线的交点坐标(以圆弧外切四边形的左上角为坐标原点,上左为负，下右为正)
    // this.crossPoint.x = radius * Math.sin(angle / 2);
    // this.crossPoint.y = -(radius / Math.cos(angle / 2) - radius);
    // console.log(this.crossPoint);

    // //圆弧最靠左的端点坐标
    // this.leftPoint.x = 0;
    // this.leftPoint.y = radius - radius * cos(angle / 2);
    // console.log(this.leftPoint);

    // //圆弧最靠右的端点坐标

    //圆弧的起点坐标
    // this.startPoint.x = 0;
    // this.startPoint.y =
    //   radius -
    //   radius * Math.cos(this.turnToRadian(angle / 2)) +
    //   this.singleTextWH.h;
    // console.log(this.startPoint);

    //圆弧的终点坐标
    // this.endPoint.x = 2 * radius * Math.sin(this.turnToRadian(angle / 2));
    // this.endPoint.y =
    //   radius -
    //   radius * Math.cos(this.turnToRadian(angle / 2)) +
    //   this.singleTextWH.h;
    // console.log(this.endPoint);

    if (this.radio > 0 && this.radio <= 50) {
      //小于半圆的情况

      let referAngle = angle / 2;
      let referRadian = this.turnToRadian(referAngle);
      //圆弧的起点坐标
      let startPointY = radius - radius * Math.cos(referRadian);

      //圆弧的终点坐标
      let endPointX = 2 * radius * Math.sin(referRadian);
      let endPointY = radius - radius * Math.cos(referRadian);

      this.path = `M0 ${startPointY} A${radius} ${radius} 0 0 1 ${endPointX} ${endPointY}`;
    } else if (this.radio > 50) {
      //大于半圆的情况

      let referAngle = angle / 2 - 90;
      let referRadian = this.turnToRadian(referAngle);
      //圆弧的起点坐标
      let startPointX = radius - radius * Math.cos(referRadian);
      let startPointY = radius + radius * Math.sin(referRadian);

      //圆弧的终点坐标
      let endPointX = radius + radius * Math.cos(referRadian);
      let endPointY = radius + radius * Math.sin(referRadian);

      let common = `A${radius} ${radius} 0 0 1`;

      //左侧小圆弧
      let leftPart = `${common} 0 ${radius}`;
      //中间半圆
      let middlePart = `${common} ${radius * 2} ${radius}`;
      //右侧小圆弧
      let rightPart = `${common} ${endPointX} ${endPointY}`;

      this.path = `M${startPointX} ${startPointY} ${leftPart},${middlePart},${rightPart}`;
    } else if (this.radio < 0 && this.radio >= -50) {
      //反方向小于半圆的情况
      radius += this.singleTextWH.h / 2;
      this.radius = radius;

      this.totalLength = (Math.abs(angle) * Math.PI * radius) / 180 + this.singleTextWH.h;

      let referAngle = Math.abs(angle) / 2;
      let referRadian = this.turnToRadian(referAngle);
      // let newRadius = Math.abs(radius);
      let startPointX = radius * Math.sin(referRadian) * 2;

      this.path = `M0 0 A${radius} ${radius} 0 0 0 ${startPointX} 0`;
    } else if (this.radio < -50) {
      //反方向大于半圆的情况

      radius += this.singleTextWH.h / 2;
      this.radius = radius;

      this.totalLength = (Math.abs(angle) * Math.PI * radius) / 180 + this.singleTextWH.h;

      let referAngle = Math.abs(angle) / 2 - 90;
      let referRadian = this.turnToRadian(referAngle);
      // let newRadius = Math.abs(radius);

      let y = radius * Math.sin(referRadian);
      let x = radius - radius * Math.cos(referRadian);

      let startPointX = radius * Math.cos(referRadian) * 2 + x;

      let common = `A${radius} ${radius} 0 0 0`;

      //左侧小圆弧
      let leftPart = `${common} 0 ${y}`;
      //中间半圆
      let middlePart = `${common} ${radius * 2} ${y}`;
      //右侧小圆弧
      let rightPart = `${common} ${startPointX} 0`;

      this.path = `M${x} 0 ${leftPart},${middlePart},${rightPart}`;
    }
  }

  // changeShape(index: number) {
  //   console.log(index);
  // }

  // changeRadian(index: number) {
  //   // console.log(this.number);
  //   this.radian = (this.number * 2 * Math.PI) / 100;
  //   let allAngle = (this.radian * 180) / Math.PI;
  //   let inRadius = (this.inArc * 180) / (allAngle * Math.PI);
  //   let outRadius = inRadius + this.textHeight;
  //   let eachRadian = this.radian / this.textLength;
  //   let startRadian = Math.PI / 2 - this.radian / 2;
  //   let perAngle = allAngle / this.textLength;
  //   let startAngle = 90 - allAngle / 2;

  //   console.log(
  //     `弧度:${this.radian}-角度:${allAngle}-内弧长:${this.inArc}-内半径:${inRadius}-外半径:${outRadius}-单个弧度:${eachRadian}-开始弧度:${startRadian}`
  //   );
  //   let angle = startRadian + eachRadian * index;
  //   // let angle = this.turnToAngle(angleCoefficient * eachRadian * index);

  //   let x = Math.cos(angle) * inRadius + inRadius;
  //   let y = Math.sin(angle) * inRadius - inRadius;
  //   let alpha = ((angle + Math.PI / 2) * 180) / Math.PI;
  //   return { x: x, y: y, angle: alpha };
  // }

  turnToAngle(radian: number) {
    return (radian * 180) / Math.PI;
  }
  turnToRadian(angle: number) {
    return (angle * Math.PI) / 180;
  }
}
</script>
<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  .controls {
    /* margin: 50px; */
    position: absolute;
    z-index: 99;
    top: 300px;
    left: 20px;
  }
}
</style>
