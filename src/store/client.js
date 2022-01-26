// 客户端状态
// noinspection JSUnusedLocalSymbols


import {getClientSize} from "@/assets/js/utils/ClientUtils";

export default {
    namespaced: true,
    state: {
        clientWidth: 0,
        clientHeight: 0,
        direction: '',
        clientMode: 'PC端',
    },
    mutations: {
        init(state) {
            let check = () => {
                const {clientWidth, clientHeight} = getClientSize();
                state.clientHeight = clientHeight
                state.clientWidth = clientWidth
                state.direction = clientWidth >= clientHeight ? '横屏' : '竖屏';
                state.clientMode = clientWidth > 900 ? 'PC端' : '移动端'
            }
            check()
            setInterval(check, 1000)
        },
        method(state, payload) {

        },

    },
    actions: {
        method: ({dispatch, commit, state}, payload) => {

        },
    },
    getters: {},
}