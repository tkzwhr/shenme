<template>
  <el-container>
    <el-form :model="form">
      <el-form-item label="スプレドシートのID">
        <el-input v-model="form.spreadsheetId" class="spreadsheet-id"></el-input>
      </el-form-item>
      <el-form-item label="スプレッドシートのシートの位置">
        <el-input-number v-model="form.spreadsheetNumber" label="描述文字"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">開始</el-button>
      </el-form-item>
    </el-form>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  @Component
  export default class Home extends Vue {
    private form = {
      spreadsheetId: '1iH55w3rJxZu0wBGs0AoAqwUpE_iSo28-QTU8voB7EMY',
      spreadsheetNumber: 1
    }

    onSubmit() {
      this.$router.push({
        name: 'Quiz',
        query: {
          sheetId: this.form.spreadsheetId,
          sheetNumber: this.form.spreadsheetNumber
        }
      } as any)
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
  }
  .spreadsheet-id > input {
    width: 600px !important;
  }
</style>
