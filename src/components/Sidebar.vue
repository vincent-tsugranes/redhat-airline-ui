<template>
  <div id="sidebar">
    <div id="view" :class="[{'collapsed' : collapsed}]">
      <router-view/>
    </div>
    <sidebar-menu
      class='sidebar'
      :menu="menu"
      :collapsed='collapsed'
      @item-click='onItemClick'
      @collapse='onCollapse'
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      menu: [
        {
          header: true,
          title: 'Red Hat Airline',
          hiddenOnCollapse: true
        },
        {
          href: '/',
          title: 'Schedule',
          icon: 'fa fa-list-alt'
        },
        {
          href: '/map',
          title: 'Map',
          icon: 'fa fa-globe'
        }
      ],
      collapsed: true
    }
  },
  methods: {
    onItemClick (e, i) {
      console.log('onItemClick')
    },
    onCollapse (c) {
      console.log('onCollapse')
      this.collapsed = c
    }
  }
}
</script>

<style>
#view {
  padding-left: 200px;
}
#view.collapsed {
  padding-left: 50px;
}

.sidebar.v-sidebar-menu {
  width: 200px;
}

.sidebar.v-sidebar-menu .vsm--mobile-item {
  z-index: 0 !important;
}
.sidebar.v-sidebar-menu.vsm_collapsed .vsm--link_level-1:hover {
  background-color: transparent;
}

.sidebar.v-sidebar-menu .vsm-arrow:after {
  content: "\f105";
  font-family: "FontAwesome";
}
.sidebar.v-sidebar-menu .collapse-btn:after {
  content: "\f07e";
  font-family: "FontAwesome";
}
</style>
