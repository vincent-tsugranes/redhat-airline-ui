<template>
  <v-app>
    <Sidebar />
  </v-app>
</template>

<style>
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

<script>
// @ is an alias to /src
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'App',
  components: {
    Sidebar
  }
}

</script>
