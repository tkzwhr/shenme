<template>
  <el-container>
    <el-main>
      <div class="header">
        <div>
          Google Spreadsheet
        </div>
        <div class="spreadsheet-url">
          <el-input
            v-model="newSheetUrl"
            :readonly="sheetUrl !== null"
            placeholder="https://docs.google.com/spreadsheets/d/abcdefghijklmnopqrstuvwxyz1234567890/edit#gid=0"
          ></el-input>
        </div>
        <div v-if="sheetUrl === null">
          <el-button type="primary" @click="syncSpreadsheet">Sync</el-button>
        </div>
        <div v-else>
          <el-button @click="syncSpreadsheet" class="button-margin-right">Re-Sync</el-button>
          <el-popconfirm
            title="All data will be lost. This operation cannot be undone. Do you really continue?"
            confirm-button-text='Delete'
            confirm-button-type="danger"
            cancel-button-text='Cancel'
            icon="el-icon-info"
            icon-color="red"
          >
            <el-button slot="reference" type="danger">Delete</el-button>
          </el-popconfirm>
        </div>
      </div>

      <el-table v-if="sheetUrl !== null" :data="tableData" height="50vh">
        <el-table-column
          label="Sheet Name"
          prop="sheetName">
        </el-table-column>
        <el-table-column
          align="right"
          label="Latest Used Date"
          prop="latestUsedDate">
        </el-table-column>
      </el-table>

      <el-dialog title="Synchronizing sheets..." :visible.sync="dialogVisible">
        <el-alert
          v-if="loadingMessage"
          type="error"
          :title="loadingMessage"
          :closable="false"
          show-icon>
        </el-alert>
        <el-table v-else :data="sheets" v-loading="isLoadingSpreadsheet">
          <el-table-column label="Sheet Name" prop="sheetName"></el-table-column>
          <el-table-column align="right">
            <template slot-scope="scope">
              <el-tooltip
                v-if="scope.row.status.message"
                :content="scope.row.status.message"
                placement="top"
              >
                <el-button
                  size="mini"
                  :type="scope.row.status.type"
                  :icon="scope.row.status.icon"
                  :loading="scope.row.status.loading"
                  circle
                ></el-button>
              </el-tooltip>
              <el-button
                v-else
                size="mini"
                :type="scope.row.status.type"
                :icon="scope.row.status.icon"
                :loading="scope.row.status.loading"
                circle
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import axios from 'axios';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import { Component, Vue } from 'vue-property-decorator';
  import $wordNote from '@/store/wordNote';

  dayjs.extend(relativeTime);

  @Component
  export default class Top extends Vue {
    private sheetUrl: string | null = 'https://docs.google.com/spreadsheets/d/1iH55w3rJxZu0wBGs0AoAqwUpE_iSo28-QTU8voB7EMY/edit#gid=0';
    //private sheetUrl: string | null = null;
    private newSheetUrl = this.sheetUrl;

    private sheets: Array<any> = [];
    private dialogVisible = false;
    private isLoadingSpreadsheet = false;
    private loadingMessage: string | null = null;

    private tableData: Array<any> = [];

    private applyStatus(code: string, message: string | null): any {
      switch (code) {
        case 'SUCCESS':
          return {
            type: 'success',
            loading: false,
            icon: 'el-icon-check',
            message
          };
        case 'FAILED':
          return {
            type: 'warning',
            loading: false,
            icon: 'el-icon-close',
            message
          };
        default:
          return {
            type: 'default',
            loading: true,
            icon: null,
            message
          };
      }
    }

    syncSpreadsheet() {
      this.dialogVisible = true;
      this.loadingMessage = null;
      this.isLoadingSpreadsheet = true;
      setTimeout(() => {
        this.isLoadingSpreadsheet = false;
        this.loadingMessage = 'invalid';
        this.sheets = [
          {
            sheetId: "a1",
            sheetName: "シート１",
            status: this.applyStatus('LOADING', null)
          },
          {
            sheetId: "a2",
            sheetName: "シート２",
            status: this.applyStatus('LOADING', null)
          },
          {
            sheetId: "a3",
            sheetName: "シート３",
            status: this.applyStatus('LOADING', null)
          }
        ];
        setTimeout(() => {
          this.sheets.find(t => t.sheetId === 'a1').status = this.applyStatus('SUCCESS', null);
        }, 1000);
        setTimeout(() => {
          this.sheets.find(t => t.sheetId === 'a2').status = this.applyStatus('FAILED', 'Invalid format.');
        }, 1500);
        setTimeout(() => {
          this.sheets.find(t => t.sheetId === 'a3').status = this.applyStatus('SUCCESS', null);
        }, 800);
      }, 3000);
    }

    // async onSubmit() {
    //   try {
    //     await axios.get(`https://spreadsheets.google.com/feeds/list/${this.form.spreadsheetId}/${this.form.spreadsheetNumber.toString()}/public/values?alt=json-in-script`);
    //     await $wordNote
    //       .download({
    //         sheetId: this.form.spreadsheetId,
    //         sheetNumber: this.form.spreadsheetNumber.toString()
    //       })
    //     await this.$router.push({
    //       name: 'Quiz',
    //       params: {
    //         holderId: `${this.form.spreadsheetId}-${this.form.spreadsheetNumber}`
    //       }
    //     } as any)
    //   } catch (err) {
    //     if (err.message === 'Request failed with status code 400') {
    //       console.log((this as any).$notify);
    //       (this as any).$notify.error({
    //         title: 'Error',
    //         message: 'Spreadsheetの読み込みに失敗しました。'
    //       });
    //     } else if (err.message === 't.gsx$front is undefined') {
    //       console.log((this as any).$notify);
    //       (this as any).$notify.error({
    //         title: 'Error',
    //         message: '1行目にFrontがありません。'
    //       });
    //     } else if (err.message === 't.gsx$back is undefined') {
    //       (this as any).$notify.error({
    //         title: 'Error',
    //         message: '1行目にBackがありません。'
    //       });
    //     }
    //   }
    // }
  }
</script>

<style lang="scss" scoped>
  .header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;

    > .spreadsheet-url {
      flex: auto;
      margin-left: 1rem;
      margin-right: 2rem;
    }
  }
  .button-margin-right {
    margin-right: 10px;
  }
</style>
