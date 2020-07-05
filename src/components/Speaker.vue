<template>
  <el-button
    :type="disabled ? 'default' : 'primary'"
    icon="custom-icon el-icon-headset"
    :disabled="disabled || isSpeaking"
    circle
    @click="speak()"
  ></el-button>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

  @Component
  export default class Speaker extends Vue {
    @Prop() private readonly text!: string;
    @Prop() private readonly disabled!: boolean;

    private speech!: SpeechSynthesisUtterance;
    private isSpeaking = false

    // noinspection JSUnusedGlobalSymbols
    mounted() {
      this.speech = new SpeechSynthesisUtterance(this.text);
      this.speech.lang = 'zh-CN';
      this.speech.onstart = () => {
        this.isSpeaking = true;
      }
      this.speech.onend = () => {
        this.isSpeaking = false;
        this.spoke();
      }
    }

    speak() {
      this.speech.text = this.text;
      window.speechSynthesis.speak(this.speech);
    }

    @Emit()
    spoke() {
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
