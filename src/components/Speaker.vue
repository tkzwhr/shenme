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
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class Speaker extends Vue {
    @Prop() private text!: string;

    private speech!: SpeechSynthesisUtterance;
    private isSpeaking = false

    speak() {
      this.speech.text = this.text;
      window.speechSynthesis.speak(this.speech);
    }

    mounted() {
      this.speech = new SpeechSynthesisUtterance(this.text);
      this.speech.lang = 'zh-CN';
      this.speech.onstart = () => {
        this.isSpeaking = true;
      }
      this.speech.onend = () => {
        this.isSpeaking = false;
      }
    }
  }
</script>

<style>
  .custom-icon {
    font-size: 10vh;
  }
</style>
