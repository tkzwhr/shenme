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
  import axios from 'axios';
  import { Component, Vue } from 'vue-property-decorator';
  import $wordNote from '@/store/wordNote';

  @Component
  export default class Top extends Vue {
    private form = {
      spreadsheetId: '1iH55w3rJxZu0wBGs0AoAqwUpE_iSo28-QTU8voB7EMY',
      spreadsheetNumber: 1
    }

    async onSubmit() {
      try {
        await axios.get(`https://spreadsheets.google.com/feeds/list/${this.form.spreadsheetId}/${this.form.spreadsheetNumber.toString()}/public/values?alt=json-in-script`);
        await $wordNote
          .download({
            sheetId: this.form.spreadsheetId,
            sheetNumber: this.form.spreadsheetNumber.toString()
          })
        await this.$router.push({
          name: 'Quiz',
          params: {
            holderId: `${this.form.spreadsheetId}-${this.form.spreadsheetNumber}`
          }
        } as any)
      } catch (err) {
        if (err.message === 'Request failed with status code 400') {
          console.log((this as any).$notify);
          (this as any).$notify.error({
            title: 'Error',
            message: 'Spreadsheetの読み込みに失敗しました。'
          });
        } else if (err.message === 't.gsx$front is undefined') {
          console.log((this as any).$notify);
          (this as any).$notify.error({
            title: 'Error',
            message: '1行目にFrontがありません。'
          });
        } else if (err.message === 't.gsx$back is undefined') {
          (this as any).$notify.error({
            title: 'Error',
            message: '1行目にBackがありません。'
          });
        }
      }
    }
  }
</script>

<style lang="scss">
</style>
