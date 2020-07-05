<template>
  <el-button
    type="primary"
    icon="custom-icon el-icon-headset"
    circle
    @click="speak()"
    :disabled="isSpeaking"
  ></el-button>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

  @Component
  export default class Speaker extends Vue {
    @Prop() private readonly text!: string;

    private speech!: SpeechSynthesisUtterance;
    private isSpeaking = false

    // noinspection JSUnusedGlobalSymbols
    mounted() {
      this.speech = new SpeechSynthesisUtterance(this.text);
      this.speech.lang = 'zh-CN';
      this.speech.onstart = () => {
        this.isSpeaking = true;
        this.click();
      }
      this.speech.onend = () => {
        this.isSpeaking = false;
      }
    }

    speak() {
      this.speech.text = this.text;
      window.speechSynthesis.speak(this.speech);
    }

    @Emit()
    click() {
      return;
    }
  }
</script>

<style>
  /* noinspection CssUnusedSymbol */
  .custom-icon {
    font-size: 10vh;
  }
</style>
