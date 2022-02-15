import Vue from 'vue';
import Vuex from 'vuex';

import { auth } from './auth.module';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectFile: '尚未選取任何檔案'
  },
  mutations: {
    setFileName(state, fileName) {
      state.selectFile = fileName
      // localStorage.setItem(selectFile)
      // console.log("setFileName : ", state.selectFile);
    },
    returnFileName(state) {
      // console.log("FileName : ", state.selectFile);
      return state.selectFile
    }
  },
  actions: {
    setFileName({ commit }, fileName) {
      commit('setFileName', fileName);
    },
    returnFileName({ commit }) {
      commit('returnFileName');
    }
  },
  modules: {
    auth,
  }
});