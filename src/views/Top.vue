<template>
  <el-container>
    <el-header class="nav">
      <el-row type="flex" align="middle">
        <el-col>
          Shenme
        </el-col>
        <el-col :span="-1">
          <el-button
            icon="el-icon-setting"
            circle
            @click="dialogVisibility.settings = true"
          ></el-button>
        </el-col>
      </el-row>
    </el-header>
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
        v-if="spreadsheet.url !== null && !importDialogVisible"
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
            <RouterLink v-else :to="{ name: 'Quiz', params: { sheetId: scope.row.sheetId } }">{{scope.row.sheetName}}</RouterLink>
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

      <el-dialog title="Synchronizing with Google Spreadsheets..." :visible.sync="importDialogVisible">
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

      <settings-form
        :visible="dialogVisibility.settings"
        :settings="settings"
        @close="handleSettings"
      ></settings-form>
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import { Component, Watch, Vue } from 'vue-property-decorator';
  import Setting from '@/entities/setting';
  import $spreadsheet, { SpreadsheetState, SpreadsheetSheetState } from '@/store/spreadsheet';
  import $settings from '@/store/settings';
  import SettingsForm from '@/components/SettingsForm.vue';
  import GameMode from '@/enums/gameMode'

  dayjs.extend(relativeTime);

  @Component({
    components: {
      SettingsForm
    }
  })
  export default class Top extends Vue {
    private newSheetUrl: string = this.spreadsheet.url ?? '';
    private urlError: string | null = null;
    private importDialogVisible = false;
    private dialogVisibility = {
      settings: false
    };

    // noinspection JSUnusedGlobalSymbols
    mounted() {
      this.validateUrl();

      if (this.$route.query.error) {
        (this as any).$message.error(this.$route.query.error as string);
        this.$router.replace({ name: 'Top' });
      }
    }

    get spreadsheet(): SpreadsheetState {
      return {
        url: $spreadsheet.url,
        fetching: $spreadsheet.fetching,
        fetchingErrors: $spreadsheet.fetchingErrors,
        sheets: $spreadsheet.sheets,
      };
    }

    get settings(): Setting {
      return {
        gameMode: $settings.gameMode,
        answerTime: $settings.answerTime,
        repeatQuestion: $settings.repeatQuestion,
        numberOfQuestions: $settings.numberOfQuestions
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

    handleSettings(value: Setting | null) {
      this.dialogVisibility.settings = false;

      if (value) {
        $settings.UPDATE(value);
      }
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
        this.importDialogVisible = true;
        $spreadsheet.fetch(this.spreadsheetId);
      }
    }

    deleteSpreadsheet() {
      $spreadsheet.DELETE();
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
