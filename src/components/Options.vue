<template>
  <div>
    <el-row class="options-row" type="flex" justify="space-around">
      <el-col :span="11">
        <el-button class="option" :type="buttonType(0)" rounded @click="select(0)">
          {{options[0]}}
        </el-button>
      </el-col>
      <el-col :span="11">
        <el-button class="option" :type="buttonType(1)" rounded @click="select(1)">
          {{options[1]}}
        </el-button>
      </el-col>
    </el-row>
    <el-row class="options-row" type="flex" justify="space-around">
      <el-col :span="11">
        <el-button class="option" :type="buttonType(2)" rounded @click="select(2)">
          {{options[2]}}
        </el-button>
      </el-col>
      <el-col :span="11">
        <el-button class="option" :type="buttonType(3)" rounded @click="select(3)">
          {{options[3]}}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Emit, Vue } from 'vue-property-decorator';

  @Component
  export default class Speaker extends Vue {
    @Prop() private readonly options!: Array<string>;
    @Prop() private readonly successIndex?: number;
    @Prop() private readonly failureIndex?: number;

    buttonType(index: number) {
      switch (index) {
        case this.successIndex:
          return "success";
        case this.failureIndex:
          return "danger";
        default:
          return "default";
      }
    }

    @Emit()
    select(index: number) {
      return index;
    }
  }
</script>

<style lang="scss">
  .option {
    width: 100%;
  }
  .options-row {
    margin-bottom: 2rem;

  & :last-child {
      margin-bottom: 0;
    }
  }
</style>
