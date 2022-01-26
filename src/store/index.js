import { createStore } from 'vuex'
import record from "@/store/record";
import client from "@/store/client";
import image from "@/store/image";

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    record,client,image
  }
})
