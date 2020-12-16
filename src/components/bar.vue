<template>
  <g class="ctm_gantt-bar">
    <g class="ctm_gantt-bar-wrapper" v-for="(task, t_index) in tasks">
      <g class="ctm_gantt-bar-group">
        <rect
          :x="1140"
          :y="68"
          :width="304"
          :height="20"
          :rx="3"
          :ry="3"
          class="ctm_gantt-bar"
        >
          <animate
            attributeName="width"
            from="0"
            to="304"
            dur="0.4s"
            begin="0.1s"
            calcMode="spline"
            values="0;304"
            keyTimes="0; 1"
            keySplines="0 0 .58 1"
          ></animate>
        </rect>
        <rect
          :x="1140"
          :y="68"
          :width="112.48"
          :height="20"
          :rx="3"
          :ry="3"
          class="ctm_gantt-bar-progress"
        >
          <animate
            attributeName="width"
            from="0"
            to="112.48"
            dur="0.4s"
            begin="0.1s"
            calcMode="spline"
            values="0;112.48"
            keyTimes="0; 1"
            keySplines="0 0 .58 1"
          ></animate>
        </rect>
        <text :x="1292" :y="78" class="ctm_gantt-bar-label">
          Redesign website
        </text>
      </g>
      <g class="ctm_gantt-handle-group">
        <rect
          :x="1435"
          :y="69"
          :width="8"
          :height="18"
          :rx="3"
          :ry="3"
          class="ctm_gantt-handle"
        ></rect>
        <rect
          :x="1141"
          :y="69"
          :width="8"
          :height="18"
          :rx="3"
          :ry="3"
          class="ctm_gantt-handle"
        ></rect>
        <polygon
          points="1326.52,88,1336.52,88,1331.52,79.34"
          class="ctm_gantt-handle"
        ></polygon>
      </g>
    </g>
  </g>
</template>

<script>
export default {
  name: "bar",
  inject: ["$svg"],
  props: {
    index: Number,
    tasks: {
      type: Array,
      default: function() {
        return [];
      },
    },
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {
    prepare_values() {
      this.height = this.$svg.options.bar_height;
      this.corner_radius = this.$svg.options.bar_corner_radius;

      this.duration =
        date_utils.diff(this.task._end, this.task._start, "hour") /
        this.gantt.options.step;
        
      this.width = this.gantt.options.column_width * this.duration;
      this.progress_width =
        this.gantt.options.column_width *
          this.duration *
          (this.task.progress / 100) || 0;
    },
  },
};
</script>
