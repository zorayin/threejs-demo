<!--
 * @Author: 陈诗文
 * @Date: 2020-04-30 14:59:44
 * @LastEditTime: 2022-08-09 09:35:56
 * @LastEditors: chenshiwen 171287313@qq.com
 * @Description: In User Settings Edit
 * @FilePath: \audio-vision-platform\src\pages\TestOutDevEcho.vue
 -->

<template>
  <div style="margin: 40px">
    <div :style="borderStyle">
      <div ref="rotateText" :style="originTextStyle" v-if="deg == 0">
        {{ text }}
      </div>
      <!-- <div> -->
      <span
        v-for="(item, index) in splitTexts"
        :key="index"
        :style="textStyle(index)"
        ref="preText"
        v-else
        >{{ item }}</span
      >
    </div>
    <el-slider
      style="position: absolute; width: 300px; left: 300px"
      controls-position="right"
      v-model="deg"
      :min="-100"
      :max="100"
      :step="1"
    ></el-slider>
    <div class="btn" style="position: absolute; width: 300px; left: 300px; top: 100px">
      <el-radio v-model="shape" label="arc">圆弧</el-radio>
      <el-radio v-model="shape" label="wave">波浪</el-radio>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  components: {},
})
export default class Shanshuo extends Vue {
  // 旋转文字v
  private text: string = "海海海海海海海海海海海海海海海海海";
  private splitTexts: string[] = [];
  private deg: number = 0;
  private huchang: number = 0;
  private preTextWidth: number = 0;
  private preTextHeight: number = 0;
  private shape = "arc";
  private textSpacing = 10;
  mounted() {
    this.splitTexts = this.text.split("");
    // this.rotateText(0);
    this.$nextTick(() => {
      this.huchang = (this.$refs
        .rotateText as HTMLDivElement).getBoundingClientRect().width;
      this.preTextWidth = this.huchang / this.splitTexts.length;
      this.preTextHeight = (this.$refs
        .rotateText as HTMLDivElement).getBoundingClientRect().height;
    });
  }

  get originTextStyle() {
    return {
      display: "inline-block",
      "white-space": "nowrap",
      position: "absolute",
      top: 0,
      left: 0,
      "letter-spacing": `${this.textSpacing}px`,
      "font-size": `30px`,
    };
  }

  get borderStyle() {
    let result;
    let textTotalCount = this.splitTexts.length;
    let ratio = this.deg / 100;
    let angle = ratio * 360;
    let perAngle = angle / textTotalCount;
    let radius = this.radius;

    if (this.deg == 0) {
      result = {
        position: "absolute",
      };
    } else {
      if (this.shape == "arc") {
        let h = Math.cos(this.forHudujiao(angle / 2 - perAngle / 2)) * radius;
        let borderHeight =
          ratio > 0 ? radius - h + this.preTextHeight : h - radius + this.preTextHeight;
        let w =
          Math.sin(this.forHudujiao(angle / 2)) * radius +
          Math.sin(this.forHudujiao(angle / 2 - perAngle / 2)) * radius;

        // console.log(`angle:${angle}`);

        let borderWidth =
          Math.abs(angle) > 180
            ? 2 * Math.abs(radius) + this.preTextWidth - this.textSpacing
            : w + this.preTextWidth - this.textSpacing;

        result = {
          position: "absolute",
          width: `${borderWidth}px`,
          height: `${borderHeight}px`,
          border: `1px solid #000`,
        };
      } else if (this.shape == "wave") {
        let frontH = Math.cos(this.forHudujiao(angle / 4)) * radius;
        let afterH = Math.cos(this.forHudujiao(angle / 4 - perAngle / 2)) * radius;

        let borderHeight;

        if (textTotalCount % 2 == 0) {
          borderHeight =
            ratio > 0
              ? radius - frontH + (radius - frontH) + this.preTextHeight
              : frontH - radius + (frontH - radius) + this.preTextHeight;
        } else {
          borderHeight =
            ratio > 0
              ? radius - frontH + (radius - afterH) + this.preTextHeight
              : frontH - radius + (afterH - radius) + this.preTextHeight;
        }

        // let borderHeight =
        //   ratio > 0
        //     ? radius - frontH + (radius - frontH) + this.preTextHeight
        //     : frontH - radius + (frontH - radius) + this.preTextHeight;

        let frontW = Math.sin(this.forHudujiao(angle / 4)) * radius * 2;
        let afterW = Math.sin(this.forHudujiao(angle / 4 - perAngle / 2)) * radius * 2;
        let borderWidth = frontW + afterW + this.preTextWidth - this.textSpacing;

        result = {
          position: "absolute",
          width: `${borderWidth}px`,
          height: `${borderHeight}px`,
          border: `1px solid #000`,
        };
      }
    }

    return result;
  }

  textStyle(idx: number) {
    let result;
    switch (this.shape) {
      case "arc":
        result = this.rotateTextArc(idx);
        break;
      case "wave":
        result = this.rotateTextWave(idx);
        break;
      default:
        break;
    }
    // const result = this.rotateText(idx);
    if (!result) return {};
    let { rotate, offY, offX } = result;

    // this.highestTop = this.highestTop < offY ? offY : this.highestTop;
    // console.log(this.highestTop);
    // console.log(result);

    // if (rotate < 0) {
    //   return {
    //     position: "absolute",
    //     display: "inline-block",
    //     top: `${offY + 40}px`,
    //     left: `${offX + 40}px`,
    //     transform: `rotateZ(${rotate}deg)`,
    //     "transform-origin": "center center",
    //   };
    // } else {
    return {
      position: "absolute",
      display: "inline-block",
      top: `${offY}px`,
      left: `${offX}px`,
      transform: `rotateZ(${rotate}deg)`,
      "transform-origin": "center center",
      "font-size": `30px`,
    };
    // }
  }
  private radius: number = 0;
  private lastX: number = 0;
  private firstAngle: number = 0;
  private lastY: number = 0;
  private lastTextWidth: number = 0;
  private lastTextHeight: number = 0;
  private firstTextWidth: number = 0;
  private firstTextHeight: number = 0;
  private firstY: number = 0;

  rotateTextWave(idx: number) {
    //字数
    let textTotalCount = this.splitTexts.length;
    // if (idx > textTotalCount / 2) return;
    let ratio = this.deg / 100;
    // 总弧长
    // let total = this.huchang / ratio;
    // 角度
    let angle = ratio * 360;
    // console.log(angle);
    // 半径 弧长公式 l = n * Π * r / 180;
    let radius = (this.huchang * 180) / (angle * Math.PI);
    // let newRadius = ((this.huchang / 2) * 180) / (angle * Math.PI);
    this.radius = radius;
    console.log(radius);
    let perAngle = angle / textTotalCount;
    let result;

    this.$nextTick(() => {
      let preTexts = this.$refs.preText as HTMLElement[];
      // console.log(preTexts);
      // console.log(preTexts[0]);
      let index = Math.floor(textTotalCount / 2) - 1;
      this.lastTextWidth = preTexts[index].getBoundingClientRect().width;
      this.lastTextHeight = preTexts[index].getBoundingClientRect().height;
      this.firstTextWidth = preTexts[index + 1].getBoundingClientRect().width;
      this.firstTextHeight = preTexts[index + 1].getBoundingClientRect().height;
    });

    let h = Math.cos(this.forHudujiao(angle / 4)) * radius;
    let afterH = Math.cos(this.forHudujiao(angle / 4 + perAngle / 2)) * radius;

    // console.log(angle / 4);
    // console.log(`radius:${radius} h:${h}`);

    // if (this.shape == "arc") {
    //   result = {
    //     position: "absolute",
    //     top: `0px`,
    //     left: `0px`,
    //   };
    // } else if (this.shape == "wave") {
    //   result = {
    //     position: "absolute",
    //     top: `${ratio > 0 ? 0 : h - radius}px`,
    //     left: `0px`,
    //   };
    // }

    // console.log(this.lastTextWidth, this.lastTextHeight);

    if (idx < Math.floor(textTotalCount / 2)) {
      //圆弧的夹心角
      let arcAngle = angle / 2;
      let halfArcAngle = arcAngle / 2;
      let firstAngle = 180 - (90 - halfArcAngle) - perAngle / 2;
      let textAngle = 90 - (firstAngle - idx * perAngle);
      // this.firstAngle = 90 - firstAngle + perAngle / 2;
      // console.log(`1 ${perAngle}`);

      let offX = Math.sin(this.forHudujiao(textAngle)) * radius;
      let offY = Math.cos(this.forHudujiao(textAngle)) * radius;
      let firstX = Math.sin(this.forHudujiao(90 - firstAngle)) * radius;
      let firstY = Math.cos(this.forHudujiao(90 - firstAngle)) * radius;

      // console.log(`@@@@@@@@ ${idx}***${offX}***${offY}***${firstX}***${firstY}`);

      if (idx == Math.floor(textTotalCount / 2) - 1) {
        this.lastX =
          Math.sin(this.forHudujiao(textAngle + perAngle / 2)) * radius - firstX;
        this.lastY =
          radius - Math.cos(this.forHudujiao(textAngle + perAngle / 2)) * radius;
      }
      this.firstY = firstY;
      if (textTotalCount % 2 == 0) {
        result = {
          rotate: textAngle,
          offX: offX - firstX,
          offY: angle < 0 ? firstY - offY + (afterH - radius) : radius - offY,
        };
      } else {
        result = {
          rotate: textAngle,
          offX: offX - firstX,
          offY: angle < 0 ? firstY - offY + (h - radius) : radius - offY,
        };
      }

      console.log(h - radius);
    } else {
      //圆弧的夹心角
      let arcAngle = angle / 2;
      let halfArcAngle = arcAngle / 2;

      // perAngle = arcAngle / (textTotalCount - Math.floor(textTotalCount / 2));

      let firstAngle = 90 + arcAngle + (90 - halfArcAngle) - perAngle / 2;

      let textAngle = firstAngle - (idx - Math.floor(textTotalCount / 2)) * perAngle;
      let offX = Math.sin(this.forHudujiao(180 - textAngle)) * radius;
      let offY = Math.cos(this.forHudujiao(180 - textAngle)) * radius;
      let lastOffX = Math.sin(this.forHudujiao(180 - halfArcAngle)) * radius;
      let firstX = Math.sin(this.forHudujiao(180 - firstAngle - perAngle / 2)) * radius;
      let firstY = Math.cos(this.forHudujiao(180 - firstAngle - perAngle / 2)) * radius;

      // console.log(`&&&&&&& ${idx}***${offX}***${offY}***${firstX}***${firstY}`);

      // console.log(`offY:${offY}`);

      let left = offX - firstX + this.lastX;
      let top = this.lastY + offY - firstY;

      if (textTotalCount % 2 == 0) {
        result = {
          rotate: textAngle + 180,
          offX: ratio > 0 ? left : offX - firstX + this.lastX,
          offY:
            ratio > 0
              ? top
              : offY -
                Math.cos(this.forHudujiao(180 - firstAngle - perAngle)) * radius +
                (afterH - radius),
        };
      } else {
        result = {
          rotate: textAngle + 180,
          offX: ratio > 0 ? left : offX - firstX + this.lastX,
          offY:
            ratio > 0
              ? top
              : offY -
                Math.cos(this.forHudujiao(180 - firstAngle - perAngle / 2)) * radius +
                (h - radius),
        };
      }
    }

    return result;
  }

  rotateTextArc(idx: number) {
    //字数
    let textTotalCount = this.splitTexts.length;
    // if (idx > textTotalCount / 2) return;
    let ratio = this.deg / 100;
    // 总弧长
    let total = this.huchang / ratio;
    // 角度
    let angle = ratio * 360;
    // 半径 弧长公式 l = n * Π * r / 180;
    let radius = (this.huchang * 180) / (angle * Math.PI);
    this.radius = radius;

    //每个字体旋转的角度
    let perAngle = angle / textTotalCount;

    // 更改对称角度
    let offAngle = 90 - angle / 2;

    //为了对称减去多出的一块角度
    let textAngle = (textTotalCount - idx) * perAngle + offAngle - perAngle / 2;
    console.log(textAngle);
    let firstAngle = 90 + angle / 2;
    let firstOffY = Math.sin(this.forHudujiao(firstAngle)) * radius;
    let firstOffX = Math.cos(this.forHudujiao(firstAngle)) * radius;

    let offY = Math.sin(this.forHudujiao(textAngle)) * radius;
    let offX = Math.cos(this.forHudujiao(textAngle)) * radius;

    // console.log(
    //   `offX:${offX} --- offY:${offY}--textAngle:${textAngle} --angle:${angle}--radius:${radius}`
    // );
    // 2-3象限为负 1-4象限为正
    let lastTextAngle = textTotalCount * perAngle + offAngle - perAngle / 2;

    let lastOffY = Math.sin(this.forHudujiao(lastTextAngle)) * radius;
    let lastOffX = Math.cos(this.forHudujiao(lastTextAngle)) * radius;

    // let reverseHalfAngle =
    //   textTotalCount * (-180 / textTotalCount) + offAngle - -180 / textTotalCount / 2;
    let reverseOffX = Math.cos(this.forHudujiao(0)) * radius;

    if (angle < -180) {
      return {
        rotate: 90 - textAngle,
        offX: offX - reverseOffX,
        offY: radius > 0 ? radius - offY : lastOffY - offY,
      };
    } else {
      return {
        rotate: 90 - textAngle,
        offX: firstAngle > 180 ? radius + offX : offX - firstOffX,
        offY: radius > 0 ? radius - offY : lastOffY - offY,
      };
    }
  }

  rotateText234(idx: number) {
    let textTotalCount = this.splitTexts.length;
    let halfTextCount = textTotalCount / 2;

    let ratio = this.deg / 100;
    if (idx < 0) {
      ratio = -ratio;
    }
    // 总弧长
    let total = this.huchang / ratio;
    // 角度
    let angle = (ratio * 360) / 2;
    // 半径 弧长公式 l = n * Π * r / 180;
    let radius = ((this.huchang / 2) * 180) / (angle * Math.PI);
    this.radius = radius;

    console.log("半径:" + radius);

    //字数

    let halfAngle = angle / 2;

    // 前一半
    //每个字体旋转的角度
    let perAngle = halfAngle / halfTextCount;
    // 更改对称角度

    //为了对称减去多出的一块角度
    // if (halfTextCount - idx <= 0) {
    //   this.rotateTextss(idx - halfTextCount);

    // halfAngle = halfAngle;
    // let offAngle = 90 - (angle + 180) / 2;
    // let textAngle =
    //   (textTotalCount - halfTextCount - idx) * perAngle + offAngle - perAngle / 2;

    // let rotateAngle =
    //   (textTotalCount - halfTextCount - idx) * perAngle +
    //   (90 + halfAngle / 2) -
    //   perAngle / 2;

    // let firstAngle = 90 + (angle + 180) / 2;

    // let firstOffY = Math.sin(this.forHudujiao(firstAngle)) * radius;
    // let firstOffX = Math.cos(this.forHudujiao(firstAngle)) * radius;

    // let lastTextAngle = 90 - halfAngle / 2 - perAngle / 2;

    // let lastOffY = Math.sin(this.forHudujiao(lastTextAngle)) * radius;
    // let lastOffX = Math.cos(this.forHudujiao(lastTextAngle)) * radius;

    // let offY = Math.sin(this.forHudujiao(textAngle)) * radius;
    // let offX = Math.cos(this.forHudujiao(textAngle)) * radius;
    // console.log(offX, offY, firstOffX, firstOffY, lastOffX, lastOffY, radius);

    // let reverseOffX = Math.cos(this.forHudujiao(0)) * radius;

    // return {
    //   rotate: 90 - rotateAngle,
    //   offX: offX - lastOffX,
    //   offY: radius > 0 ? radius - offY : lastOffY - offY,
    // };
    // } else {
    let offAngle = 90 - halfAngle / 2;
    let textAngle = idx * perAngle + offAngle - perAngle / 2;
    // let textAngle = (textTotalCount - idx) * perAngle + offAngle - perAngle / 2;

    // let firstAngle = 90 + angle / 2;
    // let firstOffY = Math.sin(this.forHudujiao(firstAngle)) * radius;
    // let firstOffX = Math.cos(this.forHudujiao(firstAngle)) * radius;

    // let offY = Math.sin(this.forHudujiao(textAngle)) * radius;
    // let offX = Math.cos(this.forHudujiao(textAngle)) * radius;

    let firstAngle = 90 + halfAngle / 2;

    let firstOffY = Math.sin(this.forHudujiao(firstAngle)) * radius;
    let firstOffX = Math.cos(this.forHudujiao(firstAngle)) * radius;

    let offY = Math.sin(this.forHudujiao(textAngle)) * radius;
    let offX = Math.cos(this.forHudujiao(textAngle)) * radius;
    // console.log(offX, offY, radius);

    return {
      rotate: 90 - textAngle,
      offX: offX - firstOffX,
      offY: radius - offY,
    };
    // }
  }

  rotateTextss(idx: number) {
    let ratio = this.deg / 100;
    // 总弧长
    let total = this.huchang / ratio;
    // 角度
    let angle = (ratio * 360) / 2;
    // 半径 弧长公式 l = n * Π * r / 180;
    let radius = ((this.huchang / 2) * 180) / (angle * Math.PI);
    this.radius = radius;

    console.log("半径:" + radius);

    //字数
    let textTotalCount = this.splitTexts.length;

    let halfAngle = angle / 2;
    let halfTextCount = textTotalCount / 2;
    // 前一半
    //每个字体旋转的角度
    let perAngle = halfAngle / halfTextCount;
    // 更改对称角度

    let offAngle = 90 - halfAngle / 2;
    let textAngle = idx * perAngle + offAngle - perAngle / 2;

    let firstAngle = 90 + halfAngle / 2;

    let firstOffY = Math.sin(this.forHudujiao(firstAngle)) * radius;
    let firstOffX = Math.cos(this.forHudujiao(firstAngle)) * radius;

    let offY = Math.sin(this.forHudujiao(textAngle)) * radius;
    let offX = Math.cos(this.forHudujiao(textAngle)) * radius;
    // console.log(offX, offY, radius);

    return {
      rotate: 90 - textAngle,
      offX: offX - firstOffX,
      offY: radius - offY,
    };
  }

  rotateText213(idx: number) {
    let ratio = this.deg / 100;
    // 平分弧长
    let perHuchang = this.huchang / 2;
    // 总弧长
    let total = perHuchang / ratio;
    // 角度
    let angle = ratio * 180;
    // 半径 弧长公式 l = n * Π * r / 180;
    let radius = (perHuchang * 180) / (angle * Math.PI);

    let textTotalCount = this.splitTexts.length;
    if (textTotalCount <= 1) return;

    // 角度分开上下象限
    let upAngel = 90 - angle / 2;
    let downAngel = angle / 2 - 90;

    // 文字上下象限数量
    let upTextTotalCount = Math.round(textTotalCount / 2);
    let downTextTotalCount = textTotalCount - upTextTotalCount;

    // 文字上下象限平均角度
    let upPerAngel = angle / upTextTotalCount;
    let downPerAngel = angle / downTextTotalCount;

    // 为了对称减去多出的一块角度
    let upBujiao = upPerAngel / upTextTotalCount;
    let doanBujiao = downPerAngel / downTextTotalCount;

    let isDownXiangxian = idx + 1 > upTextTotalCount;

    let textAngle = isDownXiangxian
      ? (-downTextTotalCount + (idx - upTextTotalCount)) * downPerAngel + downAngel
      : (upTextTotalCount - idx) * upPerAngel - idx * upBujiao + upAngel;

    let firstAngle = isDownXiangxian ? downAngel - angle : angle + upAngel;
    let firstOffY = Math.sin(this.forHudujiao(firstAngle)) * radius;
    let firstOffX = Math.cos(this.forHudujiao(firstAngle)) * radius;

    let offY = Math.sin(this.forHudujiao(textAngle)) * radius;
    let offX = Math.cos(this.forHudujiao(textAngle)) * radius;
    console.log(`${offX} --- ${offY}--${textAngle} --${angle}`);

    // 下象限所偏移的长度
    let downOffXLen = 0;
    let downOffYLen = 0;
    if (isDownXiangxian) {
      downOffXLen =
        Math.sin(this.forHudujiao(angle / 2)) * radius * 2 +
        Math.sin(this.forHudujiao(angle / 2)) * 19.2;
      downOffYLen =
        radius -
        Math.cos(this.forHudujiao(angle / 2)) * radius +
        Math.cos(this.forHudujiao(angle / 2)) * 19.2;
    }

    //  if (angle < -180) {
    //   return {
    //     rotate: isDownXiangxian ? textAngle - 90 : 90 - textAngle,
    //     offX: offX - firstOffX + downOffXLen,
    //     offY: isDownXiangxian ? firstOffY - offY + downOffYLen : radius - offY,
    //   };
    // } else {
    //   return {
    //     rotate: isDownXiangxian ? textAngle - 90 : 90 - textAngle,
    //     offX: offX - firstOffX + downOffXLen,
    //     offY: isDownXiangxian ? firstOffY - offY + downOffYLen : radius - offY,
    //   };
    // }

    const result = {
      rotate: isDownXiangxian ? textAngle - 90 : 90 - textAngle,
      offX: offX - firstOffX + downOffXLen,
      offY: isDownXiangxian ? firstOffY - offY + downOffYLen : radius - offY,
    };
    return result;
  }

  forAngle(hudu: number) {
    return (hudu * 180) / Math.PI;
  }
  forHudujiao(angle: number) {
    return (angle * Math.PI) / 180;
  }
}
</script>
<style lang="less"></style>
