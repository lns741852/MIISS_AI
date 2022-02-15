<template>
  <div>
    <div class="Class_color" :id="data.label" :style="colorStyle"></div>
  </div>
</template>

<script>
import { Event } from "vue-tables-2";

export default {
  name: "VtIndex",
  props: ["data", "index", "column"],
  data() {
    return {
      colorStyle: {
        backgroundColor: this.$props.data.color,
      },
    };
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>
