<template>
  <div class="main">
    <div class="content" :style="fontStyle">
      <div ref="testFont" id="test-font" class="text">这是一句测试字体</div>
      <div ref="canvasTest" class="text">这是一句测试字体</div>
      <div id="my-svg-shape" class="text svg">这是一句测试字体</div>
      <div class="text text-box">
        <div ref="textContent" class="text-content">{{ text }}</div>
      </div>
      <div class="text svg-circle" style="margin-top: 200px" id="mySvg">
        <div ref="normalText" style="border: 1px solid #000; width: max-content">
          {{ text }}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :width="svgBoxWidth"
          :height="svgBoxHeight"
          style="border: 1px solid #000; display: none; overflow: visible"
          ref="svgText"
          xml:space="preserve"
        >
          <g>
            <defs>
              <path
                id="circle"
                :d="`M${svgStartX},${svgStartY} a ${svgRadius},${svgRadius} 0 1 1 ${svgEndX} ${svgEndY} `"
              />
            </defs>
          </g>
          <g
            :transform="`translate(${svgTranslateX},${svgTranslateY}) rotate(${svgBoxRotate} ${svgBoxRotateX},${svgBoxRotateY})`"
          >
            <path
              id="circle"
              :d="`M${svgStartX},${svgStartY} a ${svgRadius},${svgRadius} 0 1 1 ${svgEndX} ${svgEndY} `"
              stroke="yellow"
              stroke-width="16px"
              fill="none"
            />

            <text x="0" y="0" style="fill: red" :font-size="fontSize" ref="svgTextPath">
              <textPath xlink:href="#circle" :textLength="svgArcLength">
                {{ text }}
              </textPath>
            </text>

          </g>
        </svg>
      </div>
      <div class="text svg">
        <svg
          width="300"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 60"
          style="overflow: visible"
        >
          <g>
            <defs>
              <path
                id="path1"
                d="M 100 100 a 50 50 0 1 1 200 100z"
                stroke="black"
                fill="green"
              />

              <path
                id="path2"
                d="M 10 200 Q 200,0 400,200"
                stroke="#f00"
                stroke-width="1.5px"
                fill="none"
              ></path>
            </defs>
          </g>
          <g :style="svgFontStyle">
            <text
              v-for="(item, index) in charArcParam"
              :key="index"
              :x="item.x"
              :y="item.y"
              :transform="`rotate(${item.angle},${circleRadius} ${circleRadius})`"
            >
              {{ item.text }}
            </text>
            <!-- <text x="0" y="100" style="fill: red">
              <textPath xlink:href="#path1">
                这是一句测试字体哈哈这是一句测试字体哈哈
              </textPath>
            </text>
            <text x="0" y="0" style="fill: red">
              <textPath xlink:href="#path2">这是一句测试字体哈</textPath>
            </text> -->

            <!-- <text
              font-size="24"
              font-family="'喜鹊古字典简体'"
              style=" ;"
              x="0"
              y="0"
              transform="rotate(75 30,45)"
            >
              哈
            </text>
            <text
              font-size="24"
              font-family="'喜鹊古字典简体'"
              style=" ;"
              x="0"
              y="0"
              transform="rotate(75 30,135)"
            >
              哈
            </text> -->
          </g>
        </svg>
      </div>
    </div>
    <div class="menu">
      <div class="menu-content">
        <div class="item">
          <span>字体</span>
          <el-select v-model="fontFamily" filterable placeholder="请选择" size="large">
            <el-option
              v-for="item in fontFamilyList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <div class="item">
          <span>弧度</span>
          <el-switch
            v-model="isOpenRotate"
            active-color="#13ce66"
            inactive-color="#e4e7ed"
          >
          </el-switch>
        </div>
        <!-- <div class="item">
          <span>高度</span>
          <el-slider
            v-model="viewHeight"
            :min="60"
            :max="300"
            :step="1"
            @Change="boxChange"
          ></el-slider>
        </div> -->
        <!-- <div class="item">
          <span>弧度(宽度)</span>
          <el-slider
            v-model="viewWidth"
            :min="60"
            :max="300"
            :step="1"
            @Change="boxChange"
          ></el-slider>
        </div> -->
        <div class="item" v-if="isOpenRotate">
          <span class="demonstration">弧度</span>
          <el-slider
            v-model="arcValue"
            :min="-100"
            :max="100"
            :step="1"
            @input="svgArcChange"
          ></el-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, App } from "vue";
import { Watch } from "vue-property-decorator";
import { Options, Vue } from "vue-class-component";
import "../utils/arcText";
import $ from "jquery";
import * as THREE from "three";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import "svg.select.js"
import * as SVG from '@svgdotjs/svg.js'
import "svg.resize.js"

// import wrap from "text-in-shape";
@Options({
  components: {},
})
export default class FontSet extends Vue {
  private fontFamilyList: any = [
    {
      value: "雅黑",
      label: "雅黑",
    },
    {
      value: "斗鱼",
      label: "斗鱼",
    },
    {
      value: "庞门",
      label: "庞门",
    },
    {
      value: "真言",
      label: "真言",
    },
    {
      value: "优设",
      label: "优设",
    },
  ];
  private fontShapeList: any = [
    {
      value: "正常",
      label: "正常",
    },
    {
      value: "弧形",
      label: "弧形",
    },
  ];
  private fontFamily: string = "雅黑";
  private fontShape: string = "正常";
  private isOpenRotate: boolean = false; //是否开启弧度
  private arcValue: number = 0; //弧度大小
  private text: string = "这是一句测试字体是啊";
  //   private  $ = require( "jquery" );

  get fontStyle() {
    return {
      "font-family": this.fontFamily,
    };
  }

  get textBoxStyle() {
    if (!this.isOpenRotate) {
      return {};
    } else {
      return {
        width: `${this.viewWidth}px`,
        height: `${this.viewHeight}px`,
      };
    }
  }

  get svgFontStyle() {
    return {
      // font-family: '喜鹊古字典简体', Source Han Sans CN Regular, Symbola, Tahoma;fill: url(#grad_fill_1659333651253-150277);;" transform="translate(0 0)
      "font-family": this.fontFamily,
      fill: "#222",
    };
  }

  @Watch("fontShape")
  fontShapeChange() {
    // $("#my-svg-shape").show().arctext({
    //   radius: 180,
    // });
  }

  private totalWidth: number = 0; //字符总宽度

  private textLength: number = 0; // 文字长度
  // private viewWidth: number = 300; // view宽度
  // private viewHeight: number = 60; // view高度
  private viewWidth: number = 0; // view宽度
  private viewHeight: number = 0; // view高度
  private arcRadius: number = 0; // 圆半径
  private textHeight: number = 20; // 文字高度
  private totalRadian: number = 0; // 总弧度
  private eachRadian: number = 0; // 每个夹角弧度
  private charArcParam: any[] = [];

  // @Watch("isOpenRotate")
  initArc() {
    let ele = this.$refs.textContent as HTMLElement;
    ele.innerHTML = "";
    let textArr = this.text.split("");
    if (this.isOpenRotate) {
      textArr.forEach((val, i) => {
        ele.innerHTML += `<span style="display: inline-block;" class="single-text">${val}</span>`;
      });
    } else {
      ele.innerHTML = this.text;
    }
  }

  private totalArc: number = 0; //总弧长
  private initHeight: number = 0; //初始字框高

  private svgArcLength: number = 0; //弧长
  private svgRadius: number = 0; //半径
  private fontSize: number = 16; //字号大小
  private svgBoxRotate: number = 0;
  private svgBoxWidth: number = 0;
  private svgBoxHeight: number = 0;
  private svgTranslateX: number = 0;
  private svgTranslateY: number = 0;
  private svgStartX: number = 0;
  private svgStartY: number = 0;
  private svgEndX: number = 0;
  private svgEndY: number = 0;
  private svgBoxRotateX: number = 0;
  private svgBoxRotateY: number = 0;

  svgArcChange() {
    // this.charRotateChange();

    let normalText = this.$refs.normalText as HTMLElement;
    let svgText = this.$refs.svgText as HTMLElement;

    if (this.arcValue == 0) {
      normalText.style.display = "block";
      svgText.style.display = "none";
    } else {
      let centralAngle = (Math.abs(this.arcValue) / 100) * 360; //圆心夹角（角度制）
      let centralArc = (centralAngle * Math.PI) / 180; //圆心夹角（弧度制）
      this.svgRadius = (180 * this.svgArcLength) / (centralAngle * Math.PI); //半径
      console.log(`半径：${this.svgRadius}  圆心角：${centralAngle}`);
      let offsetX = -this.svgRadius + this.svgArcLength / 2 + this.fontSize;
      let offsetY = this.svgArcLength / 2 + this.fontSize;

      let svgTextPath = this.$refs.svgTextPath as SVGTextElement;
      console.log(svgTextPath.getBoundingClientRect());
      console.log(svgTextPath.getBBox());

      this.svgBoxWidth =
        2 * (this.svgRadius + this.fontSize) * Math.sin(centralArc / 2) + this.fontSize;

      // let boxHeight =
      //   this.svgRadius +
      //   this.fontSize -
      //   (this.svgRadius + this.fontSize) * Math.cos(centralArc / 2);
      // console.log(boxHeight);

      // this.svgBoxHeight =
      //   this.svgRadius +
      //   this.fontSize -
      //   (this.svgRadius + this.fontSize) * Math.cos(centralArc / 2);

      // Math.abs(this.arcValue) <= 50? boxHeight : boxHeight;
      // if (Math.abs(this.arcValue) <= 50) {
      //   this.svgBoxHeight = boxHeight + this.fontSize;
      // } else {
      //   this.svgBoxHeight = boxHeight;
      // }

      if (
        Math.abs(this.arcValue) >= 50 &&
        this.svgBoxWidth < 2 * (this.svgRadius + this.fontSize)
      ) {
        this.svgBoxWidth = 2 * (this.svgRadius + this.fontSize);
      }

      this.svgBoxHeight =
        this.svgRadius +
        this.fontSize -
        (this.svgRadius + this.fontSize) * Math.cos(centralArc / 2);

      // if (Math.abs(this.arcValue) < 50) {
      //   // this.svgBoxWidth = svgTextPath.getBoundingClientRect().width;
      //   // this.svgBoxHeight = 2 * (this.svgRadius + this.fontSize);
      //   this.svgBoxWidth =
      //     2 *
      //       (this.svgRadius + this.fontSize) *
      //       Math.sin((centralAngle * Math.PI) / 180 / 2) +
      //     this.fontSize;

      //   this.svgBoxHeight =
      //     this.svgRadius +
      //     this.fontSize -
      //     (this.svgRadius + this.fontSize) *
      //       Math.cos((centralAngle * Math.PI) / 180 / 2) +
      //     this.fontSize;
      // } else {
      //   this.svgBoxWidth = 2 * (this.svgRadius + this.fontSize);
      //   // this.svgBoxHeight = 2 * (this.svgRadius + this.fontSize);
      //   // this.svgBoxWidth =
      //   //   2 *
      //   //     (this.svgRadius + this.fontSize) *
      //   //     Math.sin((centralAngle * Math.PI) / 180 / 2) +
      //   //   this.fontSize;
      //   this.svgBoxHeight =
      //     this.svgRadius +
      //     this.fontSize -
      //     (this.svgRadius + this.fontSize) * Math.cos((centralAngle * Math.PI) / 180 / 2);
      // }

      console.log(`svg宽：${this.svgBoxWidth} 高：${this.svgBoxHeight}`);

      if (this.arcValue > 0) {
        this.svgBoxRotate = (180 - centralAngle) / 2;
        this.svgBoxRotateX = this.svgRadius;
        this.svgBoxRotateY = this.svgRadius;
        this.svgStartX = 0;
        this.svgEndX = 0;
        this.svgEndY = 0.1;

        this.svgStartY = this.svgRadius;
        if (offsetX <= this.fontSize) {
          this.svgTranslateX = offsetX;
        } else {
          this.svgTranslateX = this.fontSize;
        }
        this.svgTranslateY = this.fontSize;
      } else {
        this.svgBoxRotateX = this.svgRadius;
        this.svgBoxRotateY = -this.svgRadius;
        this.svgBoxRotate = -centralAngle / 2;
        this.svgEndX = 0.1;
        this.svgEndY = 0;
        this.svgStartX = this.svgRadius;
        this.svgStartY = 0;
        if (offsetX <= this.fontSize) {
          this.svgTranslateX = offsetX;
        } else {
          this.svgTranslateX = this.fontSize;
        }
        // this.svgTranslateX = this.fontSize;
        // this.svgTranslateY = 2 * this.svgRadius + this.fontSize;
        if (this.arcValue < -50) {
          this.svgTranslateY = this.svgBoxHeight - this.fontSize;
        } else {
          this.svgTranslateY = this.svgBoxHeight - this.fontSize;
        }
        console.log(offsetY);
      }

      // this.svgBoxHeight = this.svgRadius - Math.cos(centralAngle / 2) * this.svgRadius;
      // console.log(this.svgBoxHeight);

      normalText.style.display = "none";
      svgText.style.display = "block";
    }
  }

  @Watch("isOpenRotate")
  isSvgText() {
    let normalText = this.$refs.normalText as HTMLElement;
    let svgText = this.$refs.svgText as HTMLElement;
    if (!this.isOpenRotate || this.arcValue == 0) {
      normalText.style.display = "block";
      svgText.style.display = "none";
    } else {
      normalText.style.display = "none";
      svgText.style.display = "block";
    }
  }

  mounted() {
    // ($("#my-svg-shape").show() as any).arctext({
    //   radius: 40,
    // });
    // this.charRotateChange();

    let normalText = this.$refs.normalText as HTMLElement;
    this.svgArcLength = normalText.offsetWidth;
    // this.svgArcLength =
    //   (normalText.offsetWidth / (2 * Math.PI) + this.fontSize) * 2 * Math.PI;
    console.log(this.svgArcLength);

    let ele = this.$refs.textContent as HTMLElement;
    this.viewWidth = ele.offsetWidth;
    this.viewHeight = ele.offsetHeight;
    this.totalArc = this.viewWidth;
    // this.totalArc = (this.viewWidth / (2 * Math.PI) + this.fontSize) * 2 * Math.PI;
    // console.log(this.totalArc);

    this.initHeight = this.viewHeight;
    console.log(this.viewWidth, this.viewHeight, this.totalArc);
    this.initCharParam();


    // this.initArcParam();
    // this.arcTextConfig();

    // let ele = this.$refs.textContent as HTMLElement;
    // ele.innerHTML = "";
    // ele.innerHTML = ``;
    // this.text.split("").forEach((val, i) => {
    //   ele.innerHTML += `<span data-id="text-${i}" style="display: inline-block; transform:translateX(${this.charArcParam[i].x}px) translateY(${this.charArcParam[i].y}px) rotate(${this.charArcParam[i].angle}deg)" class="single">${val}</span>`;
    // });
    // let singles = document.getElementsByClassName("single") as HTMLCollection;
    // Array.from(singles).forEach((ele, i) => {
    //   (ele as HTMLElement).style.transform = ``;
    // });
  }

  boxChange() {
    this.charArcParam = [];
    this.initArcParam();
    this.arcTextConfig();
  }

  initArcParam() {
    let vW = this.viewWidth + 23;
    let vH = this.viewHeight - 25;
    this.arcRadius = vH / 2 + (vW * vW) / 8 / vH; // 垂径定理 r²=(w/2)²+(r-h)² r=h/2+w²/8h
    let textArr = this.text.split("");
    this.textLength = textArr.length;
    // this.totalRadian = Math.asin(vW / 2 / this.arcRadius) * 2; // 用反三角函数求角度，乘2之前得到的是一半的角度，乘2得到总角度（弧度制）
    // this.eachRadian = this.totalRadian / (this.textLength - 1);
    this.eachRadian = 0.85; // 0.85 // 此处是弧度值 ，可以任意一个角度，0.1弧度约为5.7度
    this.totalRadian = this.eachRadian * (textArr.length - 1);

    textArr.forEach((val, i) => {
      this.charArcParam.push({
        text: val,
        x: 0,
        y: 0,
        angle: 0,
      });
    });
  }

  arcTextConfig() {
    let vW = this.viewWidth + 23;
    let vH = this.viewHeight - 25;
    let startAngle: number = -Math.PI / 2 - this.totalRadian / 2; // 起始角度，从左到右，取第一个字符的位置为起始角度
    let ele = this.$refs.textContent as HTMLElement;
    ele.innerHTML = "";
    ele.innerHTML = ``;
    this.text.split("").forEach((val, i) => {
      let angle = startAngle + this.eachRadian * i;
      let x: number = vW / 2 + this.arcRadius * Math.cos(angle) - 23 * i;
      let y: number = this.arcRadius + this.arcRadius * Math.sin(angle);
      let alpha = ((angle + Math.PI / 2) * 180) / Math.PI;

      // if (x !== 0) {
      //   x - 23*;
      // }

      this.charArcParam[i].x = x;
      this.charArcParam[i].y = y;
      this.charArcParam[i].angle = alpha;

      ele.innerHTML += `<span style="display: inline-block; transform:translateX(${x}px) translateY(${y}px) rotate(${alpha}deg)" class="single">${val}</span>`;
    });
    console.log(this.charArcParam);

    //     let center = CGPoint(x: frame.size.width / 2 + x, y: arcRadius + textHeight + y) // 各个label中点坐标

    //     if text.isEmpty {return}
    //     let label = UILabel()
    //     label.textColor = .black
    //     label.font = UIFont.systemFont(ofSize: 15)
    //     let character:Character = text[text.index(text.startIndex, offsetBy: i)] // 获取对应索引位置上的字符
    //     label.text = String(character)
    //     label.sizeToFit()
    //     label.center = center
    //     view.addSubview(label)
    // }
  }

  initCharParam() {
    let textArr = this.text.split("");
    textArr.forEach((val) => {
      this.charArcParam.push({
        text: val,
        x: 0,
        y: 0,
        angle: 0,
      });
    });
  }

  private circleRadius: number = 0;

  arcValueChange() {
    // let vWidth=this.totalWidth;
    // let vHeight=this.initHeight;
    let parEle = this.$refs.textContent as HTMLElement;

    // let totalAngle = (this.arcValue / 100) * 360; //圆的总夹角
    let totalArcAngle = ((this.arcValue / 100) * 360 * Math.PI) / 180; //圆的总夹角(弧度制)
    // let radius = (this.totalArc * 180) / Math.PI / totalAngle + 12; //半径
    let radius = this.totalArc / totalArcAngle + 12; //半径

    this.circleRadius = radius;
    // let radiusAngle = (180 * this.totalArc) / (Math.PI * radius);

    let radiusAngle = (totalArcAngle * radius * 180) / (Math.PI * radius);

    console.log(`半径：${radius}`);
    console.log(`总弧度${totalArcAngle}`);
    console.log(`圆心角${radiusAngle}`);

    let boxWidth = Math.pow(2 * Math.sin(radiusAngle / 2) * radius, 2);
    let boxHeight = radius - Math.cos(radiusAngle / 2) * radius;
    console.log(`外切四边形的宽：${boxHeight}`);
    console.log(`外切四边形的长：${boxWidth}`);
    // this.viewWidth = this.totalArc - this.arcValue;
    // this.viewHeight = this.initHeight + this.arcValue;
    // console.log(this.viewWidth, this.viewHeight);

    // let startAngle: number = ((-Math.PI - this.totalArc / totalAngle) * 180) / Math.PI; // 起始角度，从左到右，取第一个字符的位置为起始角度
    // console.log(startAngle);
    let startArc: number = -Math.PI / 2 - totalArcAngle / 2;
    // let startAngle: number = (startArc * 180) / Math.PI;

    parEle.style.transform = `translateX(${radius * 2}px) rotate(90deg)`;

    // let startArc: number = Math.PI;

    console.log(`起始角度${startArc}`);

    let textArr = this.text.split("");

    let eachArc: number =
      totalArcAngle == 2 * Math.PI
        ? totalArcAngle / textArr.length
        : totalArcAngle / (textArr.length - 1);
    // if (totalArcAngle == 2 * Math.PI) {
    //   eachArc = totalArcAngle / textArr.length;
    // } else {
    //   eachArc = totalArcAngle / (textArr.length - 1);
    // }
    console.log(`eachAngle:${eachArc}`);

    let elements = Array.from(document.getElementsByClassName("single-text"));
    let parHeight: number = 0;
    let parWidth: number = 0;

    let halfArcNum = Math.ceil(textArr.length / 2);
    let index = 0;

    textArr.forEach((val, i) => {
      let arc = startArc + eachArc * i;
      let x = radius * Math.cos(arc);
      let y = radius + radius * Math.sin(arc) - (totalArcAngle * radius) / 2;
      let angle = (arc * 180) / Math.PI; //弧度制转角度制
      // let angle = ((arc - Math.PI / 2) * 180) / Math.PI;

      this.charArcParam[i].x = x;
      this.charArcParam[i].y = y;
      this.charArcParam[i].angle = angle;

      (elements[i] as HTMLElement).style.position = "absolute";
      (elements[
        i
      ] as HTMLElement).style.transform = `translateX(${this.charArcParam[i].x}px) translateY(${this.charArcParam[i].y}px) rotate(${this.charArcParam[i].angle}deg )`;
      (elements[i] as HTMLElement).style.transformOrigin = `${radius}px ${radius}px`;

      parHeight += (elements[i] as HTMLElement).offsetHeight;
      parWidth += (elements[i] as HTMLElement).offsetWidth;
    });
    // parEle.style.width = `${parWidth}px`;
    // parEle.style.height = `${parHeight}px`;
    console.log(this.charArcParam);

    // this.viewWidth = radius * 2;
    // this.viewHeight =
    //   radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(this.viewWidth / 2, 2));
    // this.viewHeight = Math.pow(this.viewWidth, 2) / (4 * (2 * radius - 1));
  }

  // @Watch("isOpenRotate")
  charRotateChange() {
    let ele = this.$refs.canvasTest as HTMLElement;
    let wholeText = ele.innerText;
    ele.innerHTML = "";
    if (this.isOpenRotate || true) {
      ele.innerHTML = `<canvas id="myCanvas" width="400" height="300"></canvas> `;
      let canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      let context = canvas.getContext("2d") as CanvasRenderingContext2D;
      context.font = "23px 雅黑";
      context.textAlign = "left";
      context.fillStyle = "#0000ff";
      let centralAngle = (Math.abs(this.arcValue) / 100) * 360; //圆心夹角（角度制）
      this.svgRadius = (180 * this.svgArcLength) / (centralAngle * Math.PI); //半径
      // console.log(`半径：${this.svgRadius}  圆心角：${centralAngle}`);

      let textArr = this.text.split("");
      textArr.forEach((text, i) => {
        let rad = (centralAngle / textArr.length) * i;
        let x = this.svgRadius * Math.cos(rad);
        let y = this.svgRadius * Math.sin(rad);
        console.log(x, y);
        context.fillText(text, x + this.svgRadius + 23, y + this.svgRadius + 23);
      });
      // let centerX = canvas.width / 2;
      // let centerY = canvas.height - 30;
      // let angle = Math.PI * 0.8; // radians
      // let radius = 180;
      // this.drawTextAlongArc(context, "这是一句测试字体", centerX, centerY, radius, angle);
    } else {
      ele.innerHTML = "这是一句测试字体";
    }
  }
  drawTextAlongArc(
    context: CanvasRenderingContext2D,
    str: string,
    centerX: number,
    centerY: number,
    radius: number,
    angle: number
  ) {
    context.save();
    context.translate(centerX, centerY);
    context.rotate((-1 * angle) / 2);
    context.rotate((-1 * (angle / str.length)) / 2);
    for (let n = 0; n < str.length; n++) {
      context.rotate(angle / str.length);
      context.save();
      context.translate(0, -1 * radius);
      let char = str[n];
      context.fillText(char, 0, 0);
      context.restore();
    }
    context.restore();
  }

  // @Watch("isOpenRotate")
  isOpenRotateChange() {
    let ele = this.$refs.testFont as HTMLElement;
    let wholeText = ele.innerText;
    ele.innerHTML = "";
    if (this.isOpenRotate) {
      //   let ele = this.$refs.testFont as HTMLElement;
      //   let wholeText = ele.innerText;
      //   ele.innerHTML = "";
      let styleAttr;

      wholeText.split("").forEach((val, index) => {
        ele.innerHTML += `<span data-id="text-${index}" style="display: inline-block;transition: none 0s ease 0s" class="single">${val}</span>`;
      });
      let singles = document.getElementsByClassName("single") as HTMLCollection;
      console.log(singles);
      this.calcBase();
      this.calcLetters();
      Array.from(singles).forEach((ele, i) => {
        (ele as HTMLElement).style.transform = `translateX(${this.charParam[i].x}px) translateY(${this.charParam[i].y}px) rotate(${this.charParam[i].a}deg)`;
      });
    } else {
      ele.innerHTML = wholeText;
    }
  }

  // @Watch("radiusValue")
  // radiusValueChange() {
  // let singles = document.getElementsByClassName("single") as HTMLCollection;
  // if (!singles) return;
  // // this.charParam = [];
  // // this.calcBase();
  // this.calcLetters();
  // Array.from(singles).forEach((ele, i) => {
  //   (ele as HTMLElement).style.transform = `translateX(${this.charParam[i].x}px) translateY(${this.charParam[i].y}px)`;
  // });

  // let canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
  // let context = canvas.getContext("2d") as CanvasRenderingContext2D;
  // context.clearRect(0, 0, 700, 700);
  // let textArr = this.text.split("");
  // textArr.forEach((text, i) => {
  //   let rad = ((2 * Math.PI) / 360) * (360 / textArr.length) * i;
  //   let x = (this.radiusValue - 46) * Math.cos(rad);
  //   let y = (this.radiusValue - 46) * Math.sin(rad);
  //   console.log(x, y);
  //   context.fillText(text, x + this.radiusValue, y + this.radiusValue);
  // });
  // }

  private charParam: { center: number; x: number; y: number; a: number }[] = [];
  private dtArc: number = 0;

  calcBase() {
    let singles = document.getElementsByClassName("single") as HTMLCollection;
    Array.from(singles).forEach((ele) => {
      // this.charParam.push({center:0})
      let charParam = { center: 0, x: 0, y: 0, a: 0 };
      let letterWidth = (ele as HTMLElement).offsetWidth;
      this.totalWidth += letterWidth;
      charParam.center = this.totalWidth / letterWidth / 2;
      this.charParam.push(charParam);
    });
    let centerWord = this.totalWidth / 2;
    console.log(centerWord);
    // if (this.radiusValue < centerWord) {
    //   this.radiusValue = centerWord;
    // }

    let angle = 2 * Math.asin(this.totalWidth / (2 * this.arcValue));
    //半径*角度=弧长
    this.dtArc = this.arcValue * angle;
  }
  calcLetters() {
    let iteratorX = 0;
    let singles = document.getElementsByClassName("single") as HTMLCollection;
    Array.from(singles).forEach((ele, index) => {
      // 计算每个字母的半圆弧给出每个字母对原始单词的百分比。
      let dtArcLetter = ((ele as HTMLElement).offsetWidth / this.totalWidth) * this.dtArc;
      let centerWord = this.totalWidth / 2;
      // 给定半径，dtArcLetter的角度。
      let beta = dtArcLetter / this.arcValue;
      // 半圆弧弦的中点到圆心的距离。
      // 这将是字母将被放置的地方。
      let h = this.arcValue * Math.cos(beta / 2);
      // x轴和弦最左边的点形成的角。
      let alpha = Math.acos((this.totalWidth / 2 - iteratorX) / this.arcValue);
      // x轴和弦的最右点形成的角度。
      let theta = alpha + beta / 2;
      // 由h和正交于x轴的三角形两边的距离。
      let x = Math.cos(theta) * h;
      let y = Math.sin(theta) * h;
      // 弦的中点的坐标x的值。
      let xpos = iteratorX + Math.abs(this.totalWidth / 2 - x - iteratorX);
      //最后，计算每个字母的中心点对应的翻译量。
      //也计算角度，以旋转相应的字母。
      let xval = xpos - this.charParam[index].center;
      let yval = this.arcValue - y;
      let angle = -Math.asin(x / this.arcValue) * (180 / Math.PI);

      //迭代器将被定位在每个半圆弧的第二个点上
      iteratorX = 2 * xpos - iteratorX;
      this.charParam[index].x = xval;
      this.charParam[index].y = yval;
      this.charParam[index].a = angle;
    });
    console.log(this.charParam);
  }
}
</script>
<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
}
// @font-face {
//   font-family: "斗鱼";
//   src: url("../assets/fonts/douyuFont-2.otf");
//   src: url("../assets/fonts/douyuFont-2.otf") format("embedded-opentype"),
//     url("../assets/fonts/douyuFont-2.otf") format("woff"),
//     url("../assets/fonts/douyuFont-2.otf") format("truetype"),
//     url("../assets/fonts/douyuFont-2.otf") format("svg");
// }

.main {
  width: 1140px;
  margin: 0 auto;
  display: flex;
}
.content {
  width: 70%;
}
.content .text {
  //   font-family: "庞门";
  margin-top: 30px;
}
.text-box {
  // height: 60px;
  // width: 300px;
  border: 1px solid #6b6b6b;
  // text-align: center;
  margin-top: 80px !important;
  position: absolute;
  .text-content {
    position: relative;
  }
}
.svg {
  display: none;
}

// .content div:nth-child(1) {
//   font-size: 46px;
// }
// .content div:nth-child(2) {
//   font-size: 36px;
// }
// .content div:nth-child(3) {
//   font-size: 26px;
// }
// .content div:nth-child(4) {
//   font-size: 16px;
// }
.menu {
  width: 30%;
  .menu-content {
    margin-top: 50px;
    /* border-color: aliceblue; */
    border: 1px solid #e8e8e8;
    border-radius: 3px;
    height: 840px;
    box-sizing: border-box;
    padding: 20px 20px;
    background-color: #f7fbff;
    // display: flex;
    // flex-direction: column;
    // align-items: flex-start;
    color: #6b6b6b;
    .item {
      margin-bottom: 20px;
      span {
        margin-right: 10px;
      }
    }
  }
}
</style>
