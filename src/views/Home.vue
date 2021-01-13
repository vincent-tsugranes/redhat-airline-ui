<template>
  <div class="home">
<!--
    <img alt="Vue logo" src="../assets/logo.png">
-->
    <Schedule />
  </div>
</template>

<script>
// @ is an alias to /src
import Schedule from '@/components/Schedule.vue'
export default {
  name: 'Home',
  components: {
    Schedule
  }
}

</script>
