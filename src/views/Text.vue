<template>
  <div class="main">
    <div class="content" :style="fontStyle">
      <div id="mySvg"></div>
    </div>
    <div class="menu">
      <div class="menu-content">
        <div class="item">
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
import "svg.select.js";
import * as SVG from "@svgdotjs/svg.js";
import "svg.resize.js";

@Options({
  components: {},
})
export default class Text extends Vue {
  private arcValue: number = 0;
  mounted() {
    let mySvg = SVG.SVG().addTo("#mySvg").size("100%", "100%");
    // mySvg.path("M0 0 H50 A20 20 0 1 0 100 50 v25 C50 125 0 85 0 85 z").fill("#495975");
    let defsGroup = mySvg.group();
    let defs = mySvg.defs();
    defsGroup.add(defs);
    let textPath = defs
      .path(
        "M0,40 a 40,40 0 0 1 40,-40 M40,0 a 40,40 0 0 1 40,40 M80,40 a 40,40 0 0 1 -40,40 M40,80 a 40,40 0 0 1 -40,-40"
      )
      .fill("#495975");

    let aa = mySvg.textPath("山花是啊是阿莎二", textPath);
    console.log(aa);

    // or deepSelect
    // aa.selectize({ deepSelect: true });
  }
}
</script>
<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
}
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
