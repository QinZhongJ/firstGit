<template>
  <svg xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <g class="ctm_gantt-grid-date">
      <rect
        class="ctm_gantt-grid-header"
        width="100%"
        :height="options.header_height"
        :x="0"
        :y="0"
      ></rect>
      <text
        v-for="date in showDate"
        :key="date.x"
        :class="date.isUpper ? 'upper-text' : 'lower-text'"
        :x="date.x"
        :y="date.y"
      >
        {{ date.text }}
      </text>
    </g>
    <template v-for="(pro, g_index) in $gantt.projectList">
      <g class="ctm_gantt-grid-pro" :key="g_index">
        <rect
          class="ctm_gantt-grid-group"
          width="100%"
          :height="rowHeight"
          :x="0"
          :y="getRowY(g_index)"
        ></rect>
        <template v-if="pro.showDetile">
          <g>
            <rect
              v-for="(item, t_index) in pro.tasks"
              :key="t_index"
              class="ctm_gantt-grid-row"
              width="100%"
              :height="rowHeight"
              :x="0"
              :y="getRowY(g_index, t_index)"
              :task="item.id"
            ></rect>
          </g>
          <bar :index="g_index" :tasks="pro.tasks"></bar>
        </template>
      </g>
    </template>
  </svg>
</template>

<script>
const VIEW_MODE = {
  QUARTER_DAY: "Quarter Day",
  HALF_DAY: "Half Day",
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  YEAR: "Year",
};
import date_utils from "./date_utils";
import bar from "./bar.vue";
export default {
  name: "svgWrapper",
  inject: ["$gantt"],
  components: {
    bar,
  },
  data() {
    return {
      showDate: [],
    };
  },
  computed: {
    svgStyle() {
      let width = this.dates.length * this.options.column_width;
      let len = 0;
      for (let i of this.$gantt.projectList) {
        len += 1;
        if (i.showDetile) {
          len += i.tasks.length;
        }
      }
      let height = this.options.header_height + len * this.rowHeight;
      return {
        width: `${width}px`,
        height: `${height}px`,
      };
    },
    rowHeight() {
      return this.options.bar_height + this.options.padding;
    },
  },
  created() {
    this.setup_options(this.$gantt.option);
    this.setup_tasks(this.$gantt.task);
    this.change_view_mode();
    this.bind_events();
  },
  methods: {
    getRowY(g_index, t_index) {
      let group = this.$gantt.projectList[g_index].tasks;
      let len = g_index;
      for (let i = 0; i < g_index; i++) {
        if (this.$gantt.projectList[i].showDetile) {
          len += this.$gantt.projectList[i].tasks.length;
        }
      }
      if (t_index !== undefined) {
        len += t_index + 1;
      }
      return len * this.rowHeight + this.options.header_height;
    },
    setup_options(options) {
      const default_options = {
        header_height: 60,
        column_width: 30,
        step: 24,
        view_modes: [...Object.values(VIEW_MODE)],
        bar_height: 20,
        bar_corner_radius: 3,
        padding: 18,
        view_mode: "Day",
        date_format: "YYYY-MM-DD",
        popup_trigger: "click",
        custom_popup_html: null,
      };
      this.options = Object.assign({}, default_options, options);
    },
    setup_tasks(tasks) {
      this.tasks = tasks.map((task, i) => {
        task._start = date_utils.parse(task.start);
        task._end = date_utils.parse(task.end);
        if (date_utils.diff(task._end, task._start, "year") > 10) {
          task.end = null;
        }

        if (!task.start && !task.end) {
          const today = date_utils.today();
          task._start = today;
          task._end = date_utils.add(today, 2, "day");
        }

        if (!task.start && task.end) {
          task._start = date_utils.add(task._end, -2, "day");
        }

        if (task.start && !task.end) {
          task._end = date_utils.add(task._start, 2, "day");
        }

        // if hours is not set, assume the last day is full day
        // e.g: 2018-09-09 becomes 2018-09-09 23:59:59
        const task_end_values = date_utils.get_date_values(task._end);
        if (task_end_values.slice(3).every((d) => d === 0)) {
          task._end = date_utils.add(task._end, 24, "hour");
        }

        // invalid flag
        if (!task.start || !task.end) {
          task.invalid = true;
        }

        // dependencies
        if (typeof task.dependencies === "string" || !task.dependencies) {
          let deps = [];
          if (task.dependencies) {
            deps = task.dependencies
              .split(",")
              .map((d) => d.trim())
              .filter((d) => d);
          }
          task.dependencies = deps;
        }

        return task;
      });

      this.setup_dependencies();
    },
    setup_dependencies() {
      this.dependency_map = {};
      for (let t of this.tasks) {
        for (let d of t.dependencies) {
          this.dependency_map[d] = this.dependency_map[d] || [];
          this.dependency_map[d].push(t.id);
        }
      }
    },
    change_view_mode(mode = this.options.view_mode) {
      this.update_view_scale(mode);
      this.setup_dates();
      this.render();
    },
    update_view_scale(view_mode) {
      this.options.view_mode = view_mode;

      if (view_mode === VIEW_MODE.DAY) {
        this.options.step = 24;
        this.options.column_width = 38;
      } else if (view_mode === VIEW_MODE.HALF_DAY) {
        this.options.step = 24 / 2;
        this.options.column_width = 38;
      } else if (view_mode === VIEW_MODE.QUARTER_DAY) {
        this.options.step = 24 / 4;
        this.options.column_width = 38;
      } else if (view_mode === VIEW_MODE.WEEK) {
        this.options.step = 24 * 7;
        this.options.column_width = 140;
      } else if (view_mode === VIEW_MODE.MONTH) {
        this.options.step = 24 * 30;
        this.options.column_width = 120;
      } else if (view_mode === VIEW_MODE.YEAR) {
        this.options.step = 24 * 365;
        this.options.column_width = 120;
      }
    },
    setup_dates() {
      this.setup_gantt_dates();
      this.setup_date_values();
    },
    setup_gantt_dates() {
      this.gantt_start = this.gantt_end = null;

      for (let task of this.tasks) {
        // set global start and end date
        if (!this.gantt_start || task._start < this.gantt_start) {
          this.gantt_start = task._start;
        }
        if (!this.gantt_end || task._end > this.gantt_end) {
          this.gantt_end = task._end;
        }
      }

      this.gantt_start = date_utils.start_of(this.gantt_start, "day");
      this.gantt_end = date_utils.start_of(this.gantt_end, "day");

      // add date padding on both sides
      if (this.view_is([VIEW_MODE.QUARTER_DAY, VIEW_MODE.HALF_DAY])) {
        this.gantt_start = date_utils.add(this.gantt_start, -7, "day");
        this.gantt_end = date_utils.add(this.gantt_end, 7, "day");
      } else if (this.view_is(VIEW_MODE.MONTH)) {
        this.gantt_start = date_utils.start_of(this.gantt_start, "year");
        this.gantt_end = date_utils.add(this.gantt_end, 1, "year");
      } else if (this.view_is(VIEW_MODE.YEAR)) {
        this.gantt_start = date_utils.add(this.gantt_start, -2, "year");
        this.gantt_end = date_utils.add(this.gantt_end, 2, "year");
      } else {
        this.gantt_start = date_utils.add(this.gantt_start, -1, "month");
        this.gantt_end = date_utils.add(this.gantt_end, 1, "month");
      }
    },
    setup_date_values() {
      this.dates = [];
      let cur_date = null;

      while (cur_date === null || cur_date < this.gantt_end) {
        if (!cur_date) {
          cur_date = date_utils.clone(this.gantt_start);
        } else {
          if (this.view_is(VIEW_MODE.YEAR)) {
            cur_date = date_utils.add(cur_date, 1, "year");
          } else if (this.view_is(VIEW_MODE.MONTH)) {
            cur_date = date_utils.add(cur_date, 1, "month");
          } else {
            cur_date = date_utils.add(cur_date, this.options.step, "hour");
          }
        }
        this.dates.push(cur_date);
      }
    },
    render() {
      this.make_dates();
    },
    make_dates() {
      for (let date of this.get_dates_to_draw()) {
        this.showDate.push({
          x: date.lower_x,
          y: date.lower_y,
          text: date.lower_text,
        });
        if (date.upper_text) {
          this.showDate.push({
            x: date.upper_x,
            y: date.upper_y,
            text: date.upper_text,
            isUpper: true,
          });
        }
      }
    },
    get_dates_to_draw() {
      let last_date = null;
      const dates = this.dates.map((date, i) => {
        const d = this.get_date_info(date, last_date, i);
        last_date = date;
        return d;
      });
      return dates;
    },
    get_date_info(date, last_date, i) {
      if (!last_date) {
        last_date = date_utils.add(date, 1, "year");
      }
      const date_text = {
        "Quarter Day_lower": date_utils.format(date, "HH"),
        "Half Day_lower": date_utils.format(date, "HH"),
        Day_lower:
          date.getDate() !== last_date.getDate()
            ? date_utils.format(date, "D")
            : "",
        Week_lower:
          date.getMonth() !== last_date.getMonth()
            ? date_utils.format(date, "D MMM")
            : date_utils.format(date, "D"),
        Month_lower: date_utils.format(date, "MMMM"),
        Year_lower: date_utils.format(date, "YYYY"),
        "Quarter Day_upper":
          date.getDate() !== last_date.getDate()
            ? date_utils.format(date, "D MMM")
            : "",
        "Half Day_upper":
          date.getDate() !== last_date.getDate()
            ? date.getMonth() !== last_date.getMonth()
              ? date_utils.format(date, "D MMM")
              : date_utils.format(date, "D")
            : "",
        Day_upper:
          date.getMonth() !== last_date.getMonth()
            ? date_utils.format(date, "MMMM")
            : "",
        Week_upper:
          date.getMonth() !== last_date.getMonth()
            ? date_utils.format(date, "MMMM")
            : "",
        Month_upper:
          date.getFullYear() !== last_date.getFullYear()
            ? date_utils.format(date, "YYYY")
            : "",
        Year_upper:
          date.getFullYear() !== last_date.getFullYear()
            ? date_utils.format(date, "YYYY")
            : "",
      };

      const base_pos = {
        x: i * this.options.column_width,
        lower_y: this.options.header_height - 10,
        upper_y: this.options.header_height - 35,
      };

      const x_pos = {
        "Quarter Day_lower": (this.options.column_width * 4) / 2,
        "Quarter Day_upper": 0,
        "Half Day_lower": (this.options.column_width * 2) / 2,
        "Half Day_upper": 0,
        Day_lower: this.options.column_width / 2,
        Day_upper: (this.options.column_width * 30) / 2,
        Week_lower: 0,
        Week_upper: (this.options.column_width * 4) / 2,
        Month_lower: this.options.column_width / 2,
        Month_upper: (this.options.column_width * 12) / 2,
        Year_lower: this.options.column_width / 2,
        Year_upper: (this.options.column_width * 30) / 2,
      };

      return {
        upper_text: date_text[`${this.options.view_mode}_upper`],
        lower_text: date_text[`${this.options.view_mode}_lower`],
        upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
        upper_y: base_pos.upper_y,
        lower_x: base_pos.x + x_pos[`${this.options.view_mode}_lower`],
        lower_y: base_pos.lower_y,
      };
    },
    make_bars() {},
    bind_events() {},
    view_is(modes) {
      if (typeof modes === "string") {
        return this.options.view_mode === modes;
      }
      if (Array.isArray(modes)) {
        return modes.some((mode) => this.options.view_mode === mode);
      }
      return false;
    },
  },
};
</script>
