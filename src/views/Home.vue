<template>
  <el-container>
    <el-main>
      <div class="voice">
        <speaker text="黄瓜" />
      </div>
      <options
        :options="answers"
        :success-index="selectedIndex === null ? undefined : correctIndex"
        :failure-index="selectedIndex === correctIndex ? undefined : selectedIndex"
        @select="checkAnswer"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Speaker from '@/components/Speaker.vue';
  import Options from '@/components/Options.vue';

  @Component({
    components: {
      Speaker,
      Options
    }
  })
  export default class Home extends Vue {
    private jsonp = require('jsonp');

    private answers = [
      'なす',
      'きゅうり',
      'とまと',
      'ねぎ'
    ];
    private correctIndex = 1;
    private selectedIndex: number | null = null;

    load() {
      const url = 'https://spreadsheets.google.com/feeds/list/1iH55w3rJxZu0wBGs0AoAqwUpE_iSo28-QTU8voB7EMY/1/public/values?alt=json-in-script';
      this.jsonp(url, {}, (err: any, data: any) => {
        console.log(data);
      });
    }

    checkAnswer(selectedIndex: number) {
      this.selectedIndex = selectedIndex;
    }

    mounted() {
      this.load();
    }
  }
</script>

<style lang="scss">
  .el-container {
    height: 100%;
    justify-content: center;
    align-items: center;
  }
  .el-main {
    flex: none !important;
    min-width: 100%;

    > .voice {
      text-align: center;
      margin-bottom: 10rem;
    }
  }
</style>
