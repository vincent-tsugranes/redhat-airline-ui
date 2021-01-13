<template>
  <nav>
          <v-app-bar
          color="deep-purple accent-4"
          dark
        >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute temporary app style="z-index: 1000">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="title">
                Red Hat Airline
              </v-list-item-title>
              <v-list-item-subtitle>
                subtext
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
              <v-list-item class="px-2">
                  <v-list-item-avatar>
                      <v-icon>mdi-account-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content class="text-truncate">
                      Vince
                  </v-list-item-content>
                  <v-btn icon small>
                      <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
              </v-list-item>
              <v-divider></v-divider>
          <v-list
            dense
            nav
          >
            <v-list-item
              v-for="item in items"
              :key="item.title"
              router :to="item.route"
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Sidebar extends Vue {
  data () {
    return {
      drawer: false,
      items: [
        { title: 'Schedule', icon: 'mdi-view-dashboard', route: '/' },
        { title: 'Map', icon: 'mdi-view-dashboard', route: '/map' },
        { title: 'Flights', icon: 'mdi-view-dashboard', route: '/flights' },
        { title: 'Aircraft', icon: 'mdi-image', route: '/aircraft' },
        { title: 'Airports', icon: 'mdi-help-box', route: '/airports' }
      ]
    }
  }
}
</script>
