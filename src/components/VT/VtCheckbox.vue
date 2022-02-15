<template>
  <div class="state_div">
    <div style="margin-right: 1.5rem">
      <label>
        <input
          type="checkbox"
          class="checkbox"
          v-bind:checked="data.activation"
          @click.prevent="handleSelect"
        />
        <span class="btn-box">
          <span class="btn" />
        </span>
      </label>
    </div>

    <button @click="edit" class="edit_btn">編輯</button>
    <button @click="deleteacc" class="delete_btn">
      <i class="far fa-trash-alt"></i>
    </button>
  </div>
</template>

<script>
import { Event } from "vue-tables-2";

let MSG = "";
const actMSG = "是否確定啟用該帳戶?\n帳號:";
const deactMSG = "是否確定停用該帳號?\n帳號:";

export default {
  name: "VtCheckbox",
  props: ["data", "index", "column"],
  data() {
    return {};
  },
  mounted() {},
  methods: {
    changed() {
      Event.$emit("vue-tables.accountActivationstatus", this.data);
    },
    edit() {
      Event.$emit("vue-tables.edit", this.data);
    },
    deleteacc() {
      Event.$emit("vue-tables.delete", this.data);
    },
    handleSelect() {
      MSG = this.data.activation ? deactMSG : actMSG;
      setTimeout(async () => {
        if (await ui.confirm(MSG + this.data.account)) {
          this.data.activation = !this.data.activation;
          this.changed();
        }
      });
    },
  },
};
</script>
