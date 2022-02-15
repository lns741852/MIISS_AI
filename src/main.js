
import Vue from 'vue';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import VueEvents from 'vue-events'
import BootstrapVue from 'bootstrap-vue'
import $ from 'jquery'

import App from './App.vue';
import router from './router';
import store from './store';

// 提示功能
Vue.config.productionTip = true;

Vue.use(Vuex);
Vue.use(VeeValidate);
Vue.use(VueEvents)
Vue.use($)
Vue.use(BootstrapVue)

// 初始化應用程序，使用 render 函式將 App 元件渲染出來
// 然後將應用程序綁定在 DOM 上面，該 DOM 的 ID 是 #app
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
