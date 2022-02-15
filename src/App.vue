<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import UserService from "./services/user.service";

export default {
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  mounted() {},
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/");
    },
  },
};
</script>

<style></style>
