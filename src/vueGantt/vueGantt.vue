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
                <span class="text-desc text-total"
                  >（{{ pro.tasks.length }}）</span
                >
              </div>
              <template v-for="item in pro.tasks">
                <div
                  class="custom_gantt-aside-row"
                  v-if="pro.showDetile"
                  :key="item.id"
                >
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
      default: function () {
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
    this.self_date_type = "yearAndWeek";
    console.log(this.ganttTitleDate());
  },
  methods: {
    dragControllerDiv() {
      let _this = this;
      let box = this.$refs.custom_gantt;
      let resize = this.$refs.gantt_divider;
      resize.onmousedown = function (e) {
        document.onmousemove = function (e) {
          let dx = _this.sideWidth + e.movementX;
          if (dx > 100 && dx < box.clientWidth - 100) {
            _this.sideWidth = dx;
          }
        };
        document.onmouseup = function (evt) {
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

      var tasks = names.map(function (name, i) {
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

    ganttTitleDate() {
      let start_year = 2020;
      let start_mouth = 11;
      let end_year = 2020;
      let end_mouth = 12;

      // 不自动更新日期类型，以dateType固定展示
      if (this.self_date_type === "yearAndWeek") {
        return this.yearAndWeekTitleDate(
          start_year,
          start_mouth,
          end_year,
          end_mouth
        );
      } else if (this.self_date_type === "monthAndDay") {
        return this.mouthAndDayTitleDate(
          start_year,
          start_mouth,
          end_year,
          end_mouth
        );
      } else {
        return this.yearAndMouthTitleDate(
          start_year,
          start_mouth,
          end_year,
          end_mouth
        );
      }
    },
    /**
     * 年-月模式gantt标题
     * start_year: 起始年
     * start_mouth：起始月
     * end_year：结束年
     * end_mouth：结束月
     */
    yearAndMouthTitleDate(start_year, start_mouth, end_year, end_mouth) {
      // 日期数据盒子
      let dates = [
        {
          name: `${start_year}年`,
          date: start_year,
          children: [],
        },
      ];
      // 处理年份
      let year_diff = end_year - start_year;
      // 年间隔为同一年
      if (year_diff === 0) {
        let isLeap = this.isLeap(start_year); // 是否闰年
        let mouths = this.generationMonths(
          start_year,
          start_mouth,
          end_mouth + 1,
          isLeap,
          false
        ); // 处理月份
        dates[0].children = mouths;
        return dates;
      }
      // 处理开始月份
      let startIsLeap = this.isLeap(start_year);
      let start_mouths = this.generationMonths(
        start_year,
        start_mouth,
        13,
        startIsLeap,
        false
      );
      // 处理结束月份
      let endIsLeap = this.isLeap(end_year);
      let end_mouths = this.generationMonths(
        end_year,
        1,
        end_mouth + 1,
        endIsLeap,
        false
      );
      // 年间隔等于一年
      if (year_diff === 1) {
        dates[0].children = start_mouths;
        dates.push({
          name: `${end_year}年`,
          date: end_year,
          children: end_mouths,
        });
        return dates;
      }
      // 年间隔大于1年
      if (year_diff > 1) {
        for (let i = 1; i < year_diff; i++) {
          let item_year = start_year + i;
          let isLeap = this.isLeap(item_year);
          let month_and_day = this.generationMonths(
            item_year,
            1,
            13,
            isLeap,
            false
          );
          dates.push({
            name: `${item_year}年`,
            date: item_year,
            children: month_and_day,
          });
        }
        dates.push({
          name: `${end_year}年`,
          date: item_year,
          children: end_mouths,
        });
        return dates;
      }
    },
    /**
     * 年-周模式gantt标题
     * start_year: 起始年
     * start_mouth：起始月
     * end_year：结束年
     * end_mouth：结束月
     */
    yearAndWeekTitleDate(start_year, start_mouth, end_year, end_mouth) {
      // 处理年份
      let year_diff = end_year - start_year;
      // 只存在同年或前后年的情况
      if (year_diff === 0) {
        // 年间隔为同一年
        let isLeap = this.isLeap(start_year); // 是否闰年
        let mouths = this.generationMonths(
          start_year,
          start_mouth,
          end_mouth + 1,
          isLeap,
          true,
          true
        ); // 处理月份
        return mouths;
      }
      // 处理开始月份
      let startIsLeap = this.isLeap(start_year);
      let start_mouths = this.generationMonths(
        start_year,
        start_mouth,
        13,
        startIsLeap,
        true,
        true
      );
      // 处理结束月份
      let endIsLeap = this.isLeap(end_year);
      let end_mouths = this.generationMonths(
        end_year,
        1,
        end_mouth + 1,
        endIsLeap,
        true,
        true
      );
      return start_mouths.concat(end_mouths);
    },
    /**
     * 月-日模式gantt标题
     * start_year: 起始年
     * start_mouth：起始月
     * end_year：结束年
     * end_mouth：结束月
     */
    mouthAndDayTitleDate(start_year, start_mouth, end_year, end_mouth) {
      // 处理年份
      let year_diff = end_year - start_year;
      // 只存在同年或前后年的情况
      if (year_diff === 0) {
        // 年间隔为同一年
        let isLeap = this.isLeap(start_year); // 是否闰年
        let mouths = this.generationMonths(
          start_year,
          start_mouth,
          end_mouth + 1,
          isLeap
        ); // 处理月份
        return mouths;
      }
      // 处理开始月份
      let startIsLeap = this.isLeap(start_year);
      let start_mouths = this.generationMonths(
        start_year,
        start_mouth,
        13,
        startIsLeap
      );
      // 处理结束月份
      let endIsLeap = this.isLeap(end_year);
      let end_mouths = this.generationMonths(
        end_year,
        1,
        end_mouth + 1,
        endIsLeap
      );
      return start_mouths.concat(end_mouths);
    },

    /**
     * 生成月份函数
     * year: Number 当前年份
     * start_num: Number 开始月分
     * end_num：Number 结束月份
     * isLeap: Boolean 是否闰年
     * insert_days: Boolean 是否需要插入 日
     * week: 是否以周的间隔
     */
    generationMonths(
      year,
      start_num = 1,
      end_num = 13,
      isLeap = false,
      insert_days = true,
      week = false
    ) {
      let months = [];
      if (insert_days) {
        // 无需 日 的模式
        for (let i = start_num; i < end_num; i++) {
          // 需要 日 的模式
          let days = this.generationDays(year, i, isLeap, week);
          months.push({
            name: `${i}月`,
            date: i,
            full_date: `${year}-${i}`,
            children: days,
          });
        }
        return months;
      }
      for (let i = start_num; i < end_num; i++) {
        // 需要 日 的模式
        months.push({
          name: `${i}月`,
          date: i,
          full_date: `${year}-${i}`,
        });
      }
      return months;
    },
    /**
     * 生成日期函数
     * year: Number 当前年份
     * month: Number 当前月份
     * isLeap: Boolean 是否闰年
     * week: Boolean 是否间隔一周
     */
    generationDays(year, month, isLeap = false, week = false) {
      let big_month = [1, 3, 5, 7, 8, 10, 12].includes(month);
      let small_month = [4, 6, 9, 11].includes(month);
      let dates_num = big_month ? 32 : small_month ? 31 : isLeap ? 30 : 29;
      let days = [];
      if (week) {
        let _day = 1; // 从周日开始
        let _start_day_inweek = this.timeInWeek(`${year}-${month}-1`);
        
        if (_start_day_inweek !== 0) {
          _day = 8 - _start_day_inweek;
        }
        for (let i = _day; i < dates_num; i += 7) {
          days.push({
            date: i,
            name: `${i}日`,
            full_date: `${year}-${month}-${i}`,
          });
          console.log(this.getYearWeek(`${year}-${month}-${i}`))
        }
      } else {
        for (let i = 1; i < dates_num; i++) {
          days.push({
            date: i,
            name: `${i}日`,
            full_date: `${year}-${month}-${i}`,
          });
        }
      }
      return days;
    },

    timeInWeek(date) {
      let dateArray = date.split("-");
      let dateObj = new Date(
        dateArray[0],
        parseInt(dateArray[1] - 1),
        dateArray[2]
      );
      return dateObj.getDay();
    },
    /**
     * 某一天是今年的第多少周
     * dateString: String 日期格式
     */
    getYearWeek(dateString) {
      var da = dateString; //日期格式2015-12-30
      //当前日期
      var date1 = new Date(
        da.substring(0, 4),
        parseInt(da.substring(5, 7)) - 1,
        da.substring(8, 10)
      );
      //1月1号
      var date2 = new Date(da.substring(0, 4), 0, 1);
      //获取1月1号星期（以周一为第一天，0周一~6周日）
      var dateWeekNum = date2.getDay() - 1;
      if (dateWeekNum < 0) {
        dateWeekNum = 6;
      }
      if (dateWeekNum < 4) {
        //前移日期
        date2.setDate(date2.getDate() - dateWeekNum);
      } else {
        //后移日期
        date2.setDate(date2.getDate() + 7 - dateWeekNum);
      }
      var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
      if (d < 0) {
        var date3 = date1.getFullYear() - 1 + "-12-31";
        return getYearWeek(date3);
      } else {
        //得到年数周数
        var year = date1.getFullYear();
        var week = Math.ceil((d + 1) / 7);
        return year + "年第" + week + "周";
      }
    },
    /**
     * 是否闰年函数
     * year: Number 当前年份
     */
    isLeap(year) {
      return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    },
  },
};
</script>

<style lang="scss">
$bg-color: #ffffff !default;
$border-color: #f3f3f3 !default;
$bar-color: #b8c2cc !default;
$bar-stroke: #8d99a6 !default;

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
