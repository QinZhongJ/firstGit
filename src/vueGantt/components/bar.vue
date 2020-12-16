<template>
  <g class="ctm_gantt-bar">
    <g
      class="ctm_gantt-bar-wrapper"
      v-for="(task, t_index) in tasks"
      :key="t_index"
    >
      <g class="ctm_gantt-bar-group">
        <rect
          :x="compute_x(task)"
          :y="compute_y(task, t_index)"
          :width="compute_w(task)"
          :height="height"
          :rx="corner_radius"
          :ry="corner_radius"
          class="ctm_gantt-bar"
        >
          <!-- <animate
            attributeName="width"
            from="0"
            to="304"
            dur="0.4s"
            begin="0.1s"
            calcMode="spline"
            values="0;304"
            keyTimes="0; 1"
            keySplines="0 0 .58 1"
          ></animate> -->
        </rect>
        <rect
          :x="compute_x(task)"
          :y="compute_y(task, t_index)"
          :width="compute_w(task) * (task.progress / 100 || 0)"
          :height="height"
          :rx="corner_radius"
          :ry="corner_radius"
          class="ctm_gantt-bar-progress"
        >
          <!-- <animate
            attributeName="width"
            from="0"
            to="112.48"
            dur="0.4s"
            begin="0.1s"
            calcMode="spline"
            values="0;112.48"
            keyTimes="0; 1"
            keySplines="0 0 .58 1"
          ></animate> -->
        </rect>
        <text
          :x="compute_x(task)"
          :y="compute_y(task, t_index) + height / 2"
          class="ctm_gantt-bar-label"
        >
          {{ task.name }}
        </text>
      </g>
      <g class="ctm_gantt-handle-group">
        <rect
          :x="compute_x(task)"
          :y="compute_y(task, t_index) + 1"
          :width="8"
          :height="18"
          :rx="corner_radius"
          :ry="corner_radius"
          class="ctm_gantt-handle"
        ></rect>
        <rect
          :x="compute_x(task) + compute_w(task) - 8"
          :y="compute_y(task, t_index) + 1"
          :width="8"
          :height="18"
          :rx="corner_radius"
          :ry="corner_radius"
          class="ctm_gantt-handle"
        ></rect>
        <!-- <polygon
          points="1326.52,88,1336.52,88,1331.52,79.34"
          class="ctm_gantt-handle"
        ></polygon> -->
      </g>
    </g>
  </g>
</template>

<script>
import date_utils from "./date_utils";
export default {
  name: "bar",
  props: {
    index: Number,
    tasks: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  data() {
    return {
      height: 20,
      corner_radius: 0,
    };
  },
  created() {
    this.prepare_values();
  },
  mounted() {},
  methods: {
    prepare_values() {
      this.height = this.$parent.options.bar_height;
      this.corner_radius = this.$parent.options.bar_corner_radius;
    },
    compute_x(task) {
      const { step, column_width } = this.$parent.options;
      const task_start = task._start;
      const gantt_start = this.$parent.gantt_start;

      const diff = date_utils.diff(task_start, gantt_start, "hour");
      let x = (diff / step) * column_width;

      if (this.$parent.view_is("Month")) {
        const diff = date_utils.diff(task_start, gantt_start, "day");
        x = (diff * column_width) / 30;
      }
      return x;
    },
    compute_y(task, t_index) {
      return (
        this.$parent.getRowY(this.index, t_index) +
        this.$parent.options.padding / 2
      );
    },
    compute_w(task) {
      let duration =
        date_utils.diff(task._end, task._start, "hour") /
        this.$parent.options.step;
      return this.$parent.options.column_width * duration;
    },
  },
};
</script>
