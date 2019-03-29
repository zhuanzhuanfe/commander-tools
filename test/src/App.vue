<template>
  <div id="app" style="text-align:center">
    <img src="https://pic1.zhuanstatic.com/zhuanzh/n_v2bc615c1352c2479293aa02d9951903c9.png">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
  @import './assets/css/reset.css';
</style>
<style lang='scss' scoped>
  img {
    display:inline-block;
    width: 200px;
    height: 200px;
    margin-top: 100px;
  }
</style>
