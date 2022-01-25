<template>
  <span>{{new Date(time * 1000).format("yyyy-MM-dd hh:mm:ss")}}</span>

</template>

<script>
export default {
  name: "my-timestamp",
  data() {
    return {}
  },
  computed: {},
  methods: {},
  mounted() {
  },
  watch: {},
  props: {
    time:{}
  },
}

</script>

<style scoped>

</style>