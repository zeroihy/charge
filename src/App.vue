<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body,html{
  width:100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
  background: rgb(247, 248, 250);
}
*{
  margin: 0;
  padding: 0;
}

canvas {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
   width:300px;
  height: 300px;
}
</style>
