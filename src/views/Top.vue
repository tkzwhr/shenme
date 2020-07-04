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
            :readonly="spreadsheet.url !== null"
            placeholder="https://docs.google.com/spreadsheets/d/abcdefghijklmnopqrstuvwxyz1234567890/edit#gid=0"
          ></el-input>
        </div>
        <div v-if="spreadsheet.url === null">
          <el-tooltip v-if="urlError !== null" class="item" effect="dark" :content="urlError" placement="top">
            <el-button disabled>Sync</el-button>
          </el-tooltip>
          <el-button v-else type="primary" @click="syncSpreadsheet">Sync</el-button>
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
            @onConfirm="deleteSpreadsheet"
          >
            <el-button slot="reference" type="danger">Delete</el-button>
          </el-popconfirm>
        </div>
      </div>

      <el-table
        v-if="spreadsheet.url !== null && !dialogVisible"
        :data="spreadsheet.sheets"
        height="50vh"
      >
        <el-table-column label="Sheet Name">
          <template slot-scope="scope">
            <div v-if="scope.row.fetchingErrors.length > 0">
              <el-tooltip :content="scope.row.fetchingErrors.join('\n')" placement="top">
                <span>
                  <i class="el-icon-warning"></i>
                  <span style="color: darkgrey">
                    {{scope.row.sheetName}}
                  </span>
                </span>
              </el-tooltip>
            </div>
            <div v-else>
              {{scope.row.sheetName}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="Number of Words"
          prop="words.length"
          align="right"
        ></el-table-column>
        <el-table-column
          align="right"
          label="Latest Used Date"
          prop="latestUsedDate"
        ></el-table-column>
      </el-table>

      <el-dialog title="Synchronizing with Google Spreadsheets..." :visible.sync="dialogVisible">
        <el-alert
          v-if="spreadsheet.fetchingErrors.length > 0"
          type="error"
          :title="spreadsheet.fetchingErrors.join('\n')"
          :closable="false"
          show-icon>
        </el-alert>
        <el-table v-else v-loading="spreadsheet.fetching" :data="spreadsheet.sheets" >
          <el-table-column label="Sheet Name" prop="sheetName"></el-table-column>
          <el-table-column align="right">
            <template slot-scope="scope">
              <el-tooltip
                v-if="scope.row.fetchingErrors.length > 0"
                :content="scope.row.fetchingErrors.join('\n')"
                placement="top"
              >
                <el-button
                  size="mini"
                  :type="sheetStatusType(scope.row)"
                  :icon="sheetStatusIcon(scope.row)"
                  :loading="scope.row.fetching"
                  circle
                ></el-button>
              </el-tooltip>
              <el-button
                v-else
                size="mini"
                :type="sheetStatusType(scope.row)"
                :icon="sheetStatusIcon(scope.row)"
                :loading="scope.row.fetching"
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
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import { Component, Watch, Vue } from 'vue-property-decorator';
  import $spreadsheet, { SpreadsheetState, SpreadsheetSheetState } from '@/store/spreadsheet';

  dayjs.extend(relativeTime);

  @Component
  export default class Top extends Vue {
    private newSheetUrl: string = this.spreadsheet.url ?? '';
    private urlError: string | null = null;
    private dialogVisible = false;

    get spreadsheet(): SpreadsheetState {
      return {
        url: $spreadsheet.url,
        fetching: $spreadsheet.fetching,
        fetchingErrors: $spreadsheet.fetchingErrors,
        sheets: $spreadsheet.sheets,
      };
    }

    get spreadsheetId(): string | null {
      const result = this.newSheetUrl.match(/^https:\/\/docs.google.com\/spreadsheets\/d\/([^/]+)\/.*$/);
      return (result ?? [null, null])[1];
    }

    @Watch('newSheetUrl')
    validateUrl() {
      if (!this.spreadsheetId) {
        this.urlError = "Specified url is malformed.";
        return;
      }
      this.urlError = null;
    }

    sheetStatusType(data: SpreadsheetSheetState): string {
      if (!data.fetching && data.fetchingErrors.length === 0) {
        return "success";
      } else if (!data.fetching && data.fetchingErrors.length > 0) {
        return "warning";
      } else {
        return "default";
      }
    }

    sheetStatusIcon(data: SpreadsheetSheetState): string {
      if (!data.fetching && data.fetchingErrors.length === 0) {
        return "el-icon-check";
      } else if (!data.fetching && data.fetchingErrors.length > 0) {
        return "el-icon-close";
      } else {
        return "";
      }
    }

    syncSpreadsheet() {
      if (this.spreadsheetId) {
        this.dialogVisible = true;
        $spreadsheet.fetch(this.spreadsheetId);
      }
    }

    deleteSpreadsheet() {
      $spreadsheet.DELETE();
    }

    mounted() {
      this.validateUrl();
    }
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
