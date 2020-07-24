<template>
  <b-navbar fixed-top>
    <template v-if="$route.name === 'Top'">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ name: 'Top' }" replace>
          <span class="title">Shenme</span>
        </b-navbar-item>
      </template>
      <template slot="end">
        <b-navbar-item tag="div" class="buttons">
          <b-button type="is-light" icon-left="chart-bar" @click="statistics"
            >Statistics</b-button
          >
          <b-button type="is-light" icon-left="settings" @click="settings"
            >Settings</b-button
          >
        </b-navbar-item>
      </template>
    </template>
    <template v-else-if="$route.name === 'Statistics'">
      <template slot="brand">
        <b-navbar-item @click="back">
          <b-icon icon="arrow-left"></b-icon>
        </b-navbar-item>
        <b-navbar-item tag="div" :active="false">
          <span class="has-text-weight-bold">Statistics</span>
        </b-navbar-item>
      </template>
    </template>
    <template v-else-if="$route.name === 'Exam' || $route.name === 'Training'">
      <template slot="brand">
        <b-navbar-item @click="back">
          <b-icon icon="arrow-left"></b-icon>
        </b-navbar-item>
        <b-navbar-item tag="div" :active="false">
          <span class="has-text-weight-bold">{{ title }}</span>
        </b-navbar-item>
      </template>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from "vue-property-decorator";

@Component
export default class NavBar extends Vue {
  @Prop() private readonly title!: string;

  @Emit() statistics() {
    return;
  }
  @Emit() settings() {
    return;
  }
  @Emit() back() {
    return;
  }
}
</script>
