<template>
  <div class="custom_gantt">
    <div class="custom_gantt-aside"></div>
    <div class="custom_gantt-divider"></div>
    <div class="custom_gantt-main">
      <div class="ganttTarget"></div>
    </div>
  </div>
</template>
<script>
import Gantt from "../components/customGantt/index.js";
export default {
  name: "frappeGantt",
  data() {
    return {
      tasks: [],
    };
  },
  mounted() {
    this.initFrappe();
  },
  methods: {
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
          progress: parseInt(Math.random() * 100, 10),
        };
      });
      return tasks;
    },
    initFrappe() {
      this.tasks = this.getTempTasks();
      let self = this;
      this.gant = new Gantt(".ganttTarget", this.tasks, {
        on_click: function(task) {
          console.log(task);
        },
        on_date_change: function(task, start, end) {
          console.log(task, start, end);
        },
        on_progress_change: function(task, progress) {
          console.log(task, progress);
        },
        on_view_change: function(mode) {
          console.log(mode);
        },
        language: "zh",
      });
    },
  },
};
</script>

<style scoped>
.custom_gantt {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  user-select: none;
}
.custom_gantt-aside {
  min-width: 384px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
  box-sizing: initial;
  padding-right: 23px;
  margin-right: -23px;
  z-index: 1;
}
.custom_gantt-divider {
  min-width: 7px;
  background: #fff;
  cursor: ew-resize;
  box-shadow: 0 0 3px #ddd;
  border-right: 1px #f3f3f3 solid;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}
.custom_gantt-main {
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1;
  background: #fff;
}
.ganttTarget {
  height: 500px;
}
</style>
