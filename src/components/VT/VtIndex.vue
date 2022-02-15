<template>
  <div>{{ index }}.</div>
</template>

<script>
import { Event } from "vue-tables-2";

let src = "";

export default {
  name: "VtIndex",
  props: ["data", "index", "column"],
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>
