// 
// noinspection JSUnusedLocalSymbols

import {request} from "@/assets/js/request";

export default {
    namespaced: true,
    state: {},
    mutations: {
        method(state, payload) {

        },
    },
    actions: {
        method: ({dispatch, commit, state}, payload) => {

        },
        del: ({dispatch, commit, state}, uuid) => {
            return request({
                url: "/images/del",
                params: {uuid},
            })
        },
        list: ({dispatch, commit, state}, recordUuid) => {
            return request({
                url: "/images/list",
                params: {recordUuid},
            }).then(res=>res.data)
        },
    },
    getters: {},
}