<template>
  <b-navbar fixed-top>
    <template slot="brand">
      <b-navbar-item @click="back">
        <b-icon icon="arrow-left"></b-icon>
      </b-navbar-item>
      <b-navbar-item tag="div" :active="false">
        <span class="has-text-weight-bold">{{ title }}</span>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from "vue-property-decorator";

@Component
export default class NavBarBack extends Vue {
  @Prop() private readonly title?: string;

  @Emit() back() {
    return;
  }
}
</script>
