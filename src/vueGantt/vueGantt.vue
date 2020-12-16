<template>
  <div class="demo_out">
    <div class="custom_gantt" ref="custom_gantt">
      <div class="custom_gantt-header"></div>
      <div class="custom_gantt-body">
        <div class="custom_gantt-aside" :style="{ minWidth: `${sideWidth}px` }">
          <div class="custom_gantt-aside-tasks">
            <template v-for="pro in projectList">
              <div
                :key="pro.id"
                class="custom_gantt-aside-group"
                @click="changeShowDetile(pro)"
              >
                <em></em>
                <span>{{ pro.name }}</span>
                <span class="text-desc  text-total"
                  >（{{ pro.tasks.length }}）</span
                >
              </div>
              <template v-for="item in pro.tasks">
                <div class="custom_gantt-aside-row" v-if="pro.showDetile" :key="item.id">
                  <div class="row-label">
                    <span class="label-status">未开始</span>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
        <div class="custom_gantt-divider" ref="gantt_divider">⋮</div>
        <div class="custom_gantt-main">
          <div class="custom_gantt-svg-wrapper">
            <svgWrapper></svgWrapper>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import svgWrapper from "./components/svgWrapper";
export default {
  name: "vueGantt",
  provide() {
    return { $gantt: this };
  },
  components: {
    svgWrapper,
  },
  data() {
    return {
      sideWidth: 384,
      projectList: [],
      gantStyle: {},
      showDate: [],
    };
  },
  props: {
    // group: {
    //   type: Array,
    //   default: function() {
    //     return [];
    //   },
    // },
    // task: {
    //   type: Array,
    //   default: function() {
    //     return [];
    //   },
    // },
    option: {
      type: Object,
      default: function() {
        return {};
      },
    },
  },
  created() {
    this.groups = [
      {
        name: "项目管理",
        id: "007",
      },
      {
        name: "投标管理",
        id: "008",
      },
    ];
    this.task = this.getTempTasks();
  },
  mounted() {
    this.initProjectList();
    this.dragControllerDiv();
  },
  methods: {
    dragControllerDiv() {
      let _this = this;
      let box = this.$refs.custom_gantt;
      let resize = this.$refs.gantt_divider;
      resize.onmousedown = function(e) {
        document.onmousemove = function(e) {
          let dx = _this.sideWidth + e.movementX;
          if (dx > 100 && dx < box.clientWidth - 100) {
            _this.sideWidth = dx;
          }
        };
        document.onmouseup = function(evt) {
          document.onmousemove = null;
          document.onmouseup = null;
          resize.releaseCapture && resize.releaseCapture(); //调用ReleaseCapture()释放
        };
        resize.setCapture && resize.setCapture(); //该函数在属于当前线程的指定窗口里设置鼠标捕获
        return false;
      };
    },
    initProjectList() {
      let group = {};
      for (let i of this.groups) {
        group[i.id] = [];
      }
      for (let i of this.task) {
        group[i.group_id].push(i);
      }
      for (let i of this.groups) {
        i.tasks = group[i.id];
        this.$set(i, "showDetile", true);
        this.projectList.push(i);
      }
    },
    changeShowDetile(pro) {
      this.$set(pro, "showDetile", !pro.showDetile);
    },
    getTempTasks() {
      var names = [
        ["Redesign website", [0, 7]],
        ["Write new content", [1, 4]],
        ["Apply new styles", [3, 6]],
        ["Review", [7, 7]],
        ["Deploy", [8, 9]],
        ["Go Live!", [10, 10]],
      ];

      var tasks = names.map(function(name, i) {
        var today = new Date();
        var start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        var end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        start.setDate(today.getDate() + name[1][0]);
        end.setDate(today.getDate() + name[1][1]);
        return {
          start: start,
          end: end,
          name: name[0],
          id: "Task " + i,
          group_id: i < 3 ? "007" : "008",
          progress: parseInt(Math.random() * 100, 10),
        };
      });
      return tasks;
    },
  },
};
</script>

<style lang="scss">
$bg-color: #ffffff !default;
$border-color: #f3f3f3 !default;
$bar-color: #b8c2cc !default;
$bar-stroke: #8D99A6 !default;

.demo_out {
  width: 1000px;
  height: 500px;
  padding: 20px;
}
.custom_gantt {
  width: 100%;
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  &-header {
    min-height: 60px;
    height: 60px;
    border-bottom: 1px $border-color solid;
    display: flex;
    flex-direction: row;
  }
  &-body {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
  }
  &-aside {
    min-width: 384px;
    padding-right: 23px;
    margin-right: -23px;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    position: relative;
    box-sizing: initial;
    z-index: 1;
  }
  &-aside-tasks {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    padding-bottom: 10px;
  }
  &-divider {
    min-width: 7px;
    cursor: ew-resize;
    box-shadow: 0 0 3px #ddd;
    border-right: 1px $border-color solid;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
    color: #ccc;
    font-size: 16px;
    background-color: $bg-color;
  }
  &-main {
    flex-grow: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1;
    background: $bg-color;
  }

  .text-desc {
    color: #aaa !important;
  }
  .row-style {
    cursor: pointer;
    height: 38px;
    display: flex;
  }
  &-aside-group {
    @extend .row-style;
    padding-left: 20px;
    align-items: center;
    box-shadow: inset 0 -1px 0 0 #eee;
  }
  &-aside-row {
    @extend .row-style;
    .row-label {
      flex-grow: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      padding-left: 36px;
    }
    .label-status {
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 400;
      line-height: 1;
      border-radius: 3px;
      color: rgb(51, 51, 51);
      background-color: rgba(250, 90, 85, 0.1);
      margin-right: 5px;
    }
  }

  &-svg-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: auto;
  }
  .ctm_gantt {
    &-grid-header {
      fill: $bg-color;
    }
    &-grid-date {
      .lower-text,
      .upper-text {
        font-size: 12px;
        text-anchor: middle;
      }
      .lower-text {
        fill: #333;
      }
      .upper-text {
        fill: #555;
      }
    }
    &-grid-group {
      fill: $bg-color;
      stroke: $border-color;
    }
    &-grid-row {
      fill: $bg-color;
      stroke: $border-color;
    }
    &-bar-wrapper {
      cursor: pointer;
      outline: none;
    }
    &-bar {
      fill: $bar-color;
      stroke: $bar-stroke;
      stroke-width: 0;
      transition: stroke-width 0.3s ease;
      user-select: none;
    }
    &-bar-progress {
      fill: #2490ef;
    }
    &-bar-label {
      fill: $bg-color;
      dominant-baseline: central;
      font-size: 12px;
      font-weight: lighter;
    }
    &-handle {
      fill: #ddd;
      cursor: ew-resize;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease;
    }
  }
}
</style>
