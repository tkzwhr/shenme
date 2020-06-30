<template>
  <el-container>
    <el-main v-if="isLoaded">
      <div class="voice">
        <speaker :text="quiz.question" />
      </div>
      <options
        :options="quiz.options"
        :success-index="selectedIndex === null ? undefined : quiz.correctIndex"
        :failure-index="selectedIndex === quiz.correctIndex ? undefined : selectedIndex"
        @select="checkAnswer"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Options from '@/components/Options.vue';
  import Speaker from '@/components/Speaker.vue';
  import $wordSet, { Quiz } from '@/store/wordSet';

  @Component({
    components: {
      Speaker,
      Options
    }
  })
  export default class Home extends Vue {
    private selectedIndex: number | null = null;

    get isLoaded(): boolean {
      return !!$wordSet.quiz;
    }

    get quiz(): Quiz {
      return $wordSet.quiz!;
    }

    checkAnswer(selectedIndex: number) {
      this.selectedIndex = selectedIndex;

      setTimeout(() => {
        this.selectedIndex = null;
        $wordSet.REFRESH_QUIZ();
      }, 2000);
    }

    mounted() {
      $wordSet
        .downloadWordSet({sheetId: '1iH55w3rJxZu0wBGs0AoAqwUpE_iSo28-QTU8voB7EMY', sheetNumber: '1'})
        .then(() => {
          $wordSet.REFRESH_QUIZ();
        });
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
