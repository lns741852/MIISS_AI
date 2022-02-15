<template>
  <div class="Pathology">
    <div class="container-fluid main_BG">
      <div class="main_BG2">
        <img class="img-fluid" src="../../assets/img/BG/main_BG2.png" alt="" />
        <!-- 中1 -->
        <div
          class="button_select"
          style="right: 21.5vw; top: -1vw"
          data-division_of="外科病理科"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text3.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>
        <!-- 中2 -->
        <div
          class="button_select"
          style="right: 21.5vw; top: 11vw"
          data-division_of="分子病理科"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text4.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>
        <!-- 中3 -->
        <div
          class="button_select"
          style="right: 21.5vw; top: 23vw"
          data-division_of="中央檢驗科"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text5.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>
        <!-- 左1 -->
        <div
          class="button_select"
          style="right: 32vw; top: 5vw"
          data-division_of="一般病理科"
          @click.prevent="Login"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text1.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>
        <!-- 左2 -->
        <div
          class="button_select"
          style="right: 32vw; top: 17vw"
          data-division_of="一般檢驗科"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text2.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>

        <!-- 右1 -->
        <div
          class="button_select"
          style="right: 11vw; top: 5vw"
          data-division_of="細胞病理科"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text6.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>
        <!-- 右2 -->
        <div
          class="button_select"
          style="right: 11vw; top: 17vw"
          data-division_of="微生物科"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text7.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>
        <!-- 最右 -->
        <div
          class="button_select"
          style="right: 0.5vw; top: 11vw"
          data-division_of="品保科"
        >
          <img src="../../assets/img/icon/normal.png" alt="" class="normal" />
          <img
            src="../../assets/img/icon/normal_text8.png"
            alt=""
            class="normal_text img-fluid"
          />
          <img
            src="../../assets/img/icon/active1.png"
            alt=""
            class="active hidden"
          />
        </div>
      </div>
      <div class="LOGO2">
        <img src="../../assets/img/icon/LOGO2.png" alt="" class="img-fluid" />
      </div>
      <div class="row">
        <div class="col">
          <img src="../../assets/img/icon/LOGO.png" alt="" />
        </div>
      </div>

      <div class="logout" @click.prevent="leaveSystem">
        <img class="img-fluid" src="../../assets/img/icon/logout.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Pathology",
  methods: {
            changeRouter() {
      this.$router.go(0);
    },
    Login() {
      this.$router.push("/login");
    },
    leaveSystem() {
      history.back();
    },
  },
};
$(".button_select").click(function () {
  $(".active").addClass("hidden");
  $(".normal").removeClass("hidden");
  $(".normal_text").removeClass("zIndex");

  $(this).children(".active").toggleClass("hidden");
  $(this).children(".normal").toggleClass("hidden");
  $(this).children(".normal_text").addClass("zIndex");
  let divisionOf = $(this).data("division_of");
  alert(divisionOf);
});
</script>

<style lang="scss">
.Pathology {
  @import "bootstrap/scss/bootstrap.scss";
  position:absolute;width:100%;height:100%;top:0;left:0;overflow-y:auto;
}
.container-fluid{position:absolute;width:100%;height:100%;top:0;left:0;overflow-y:auto;background-color:#dddddd}
</style>

<style scoped>
/* @import "../assets/css/reset.css"; */
/* @import "../assets/css/bootstrap.css"; */
@import "../../assets/css/pathology.css";

</style>
