<template>
  <el-container>
    <el-main v-if="isLoaded">
      <el-row class="voice" type="flex" justify="space-around" align="middle">
        <el-col :span="7">
          <div>
            正解数: 0 / 0
          </div>
          <div>
            連続正解数: 0
          </div>
        </el-col>
        <el-col :span="8">
          <speaker
            :text="quiz.question"
            @click="gameState = 'wait-answer'"
          />
        </el-col>
        <el-col :span="7">
          <time-indicator
            :command="timeIndicatorCommand"
            @time-over="gameState = 'time-over'"
          />
        </el-col>
      </el-row>
      <options
        :disabled="gameState !== 'wait-answer'"
        :options="quiz.options"
        :success-index="selectedIndex === null ? undefined : quiz.correctIndex"
        :failure-index="selectedIndex === quiz.correctIndex ? undefined : selectedIndex"
        @select="checkAnswer"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator';
  import $wordSet, { Quiz } from '@/store/wordSet';
  import TimeIndicator from '@/components/TimeIndicator.vue';
  import Speaker from '@/components/Speaker.vue';
  import Options from '@/components/Options.vue';

  @Component({
    components: {
      TimeIndicator,
      Speaker,
      Options
    }
  })
  export default class Home extends Vue {
    private gameState = '';
    private selectedIndex: number | null = null;
    private timeIndicatorCommand = "";

    mounted() {
      const sheetId = this.$route.query.sheetId as string;
      const sheetNumber = this.$route.query.sheetNumber as string;
      $wordSet
        .downloadWordSet({sheetId, sheetNumber})
        .then(() => {
          this.gameState = 'ready';
        });
    }

    @Watch('gameState', { immediate: true })
    setup(value: string) {
      switch (value) {
        case 'ready':
          $wordSet.REFRESH_QUIZ();
          this.selectedIndex = null;
          this.timeIndicatorCommand = 'set:3000';
          break;
        case 'wait-answer':
          this.timeIndicatorCommand = 'start';
          break;
        case 'time-over':
          this.selectedIndex = this.quiz.correctIndex;
          this.timeIndicatorCommand = 'stop';
          setTimeout(() => { this.gameState = 'ready'; }, 2000);
          break;
        case 'answered':
          this.timeIndicatorCommand = 'stop';
          setTimeout(() => { this.gameState = 'ready'; }, 2000);
          break;
      }
    }

    get isLoaded(): boolean {
      return !!$wordSet.quiz;
    }

    get quiz(): Quiz {
      return $wordSet.quiz ?? { question: '', options: [], correctIndex: 0 };
    }

    checkAnswer(selectedIndex: number) {
      this.selectedIndex = selectedIndex;
      this.gameState = 'answered';
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
