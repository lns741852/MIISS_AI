<template>
  <div>
    <img
      v-if="data.status"
      src="../../assets/img/icon/yes.png"
      alt=""
      style="height: 1.25rem"
    />
  </div>
</template>

<script>
import { Event } from "vue-tables-2";

let src = "";

export default {
  name: "VtSaveCheck",
  props: ["data", "index", "column"],
  data() {
    return {
      // src: "",
    };
  },
  created() {
    // src = "../../assets/img/icon/yes.png";
  },
  mounted() {},
  methods: {},
};
</script>
