<template>
  <router-view/>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style lang="scss">
  .el-container {
    font-family: sans-serif;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  .el-main {
    flex: none !important;
    width: 90%;
  }

  .nav {
    position: absolute;
    top: 0;
    width: 100vw;
    padding: 20px !important;
    font-weight: bold;
  }
</style>
