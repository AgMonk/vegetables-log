// 种菜记录
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
        add: ({dispatch, commit, state}, data) => {
            return request({
                url: "/add",
                data,
            })
        },
        update: ({dispatch, commit, state}, data) => {
            return request({
                url: "/update",
                data,
            })
        },
        getOptions: ({dispatch, commit, state}) => {
            return request({
                url: "/getOptions",
            }).then(res=>res.data)
        },
        del: ({dispatch, commit, state}, uuid) => {
            return request({
                url: "/del",
                params: {uuid},
            })
        },
        page: ({dispatch, commit, state}, {page = 1, size = 10, filter}) => {
            return request({
                url: "/page",
                data: {page, size, filter},
            }).then(res=>res.data)
        },

    },
    getters: {},
}