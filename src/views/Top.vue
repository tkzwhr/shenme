<template>
  <el-container>
    <el-header class="nav">
      <el-row type="flex" align="middle">
        <el-col>Shenme</el-col>
        <el-col :span="-1">
          <el-button icon="el-icon-setting" circle @click="dialogVisibility.settings = true"></el-button>
        </el-col>
      </el-row>
    </el-header>

    <el-main>
      <spreadsheet-panel
        :spreadsheet-url="spreadsheet.url"
        @sync="syncSpreadsheet"
        @truncate="deleteSpreadsheet"
      ></spreadsheet-panel>

      <sheet-list
        :visible="!dialogVisibility.importSpreadsheet"
        :spreadsheet="spreadsheet"
        :records="records"
        @navigate-to-game="navigateToGame"
      ></sheet-list>

      <import-spreadsheet-form
        :visible="dialogVisibility.importSpreadsheet"
        :spreadsheet="spreadsheet"
        @close="dialogVisibility.importSpreadsheet = false"
      ></import-spreadsheet-form>

      <settings-form
        :visible="dialogVisibility.settings"
        :settings="settings"
        @close="handleSettings"
      ></settings-form>
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Record from '@/entities/record';
  import Setting from '@/entities/setting';
  import $spreadsheet, { SpreadsheetState } from '@/store/spreadsheet';
  import $records from '@/store/records';
  import $settings from '@/store/settings';
  import SpreadsheetPanel from '@/components/SpreadsheetPanel.vue';
  import SheetList from '@/components/SheetList.vue';
  import ImportSpreadsheetForm from '@/components/ImportSpreadsheetForm.vue';
  import SettingsForm from '@/components/SettingsForm.vue';

  @Component({
    components: {
      SpreadsheetPanel,
      SheetList,
      ImportSpreadsheetForm,
      SettingsForm
    }
  })
  export default class Top extends Vue {
    private dialogVisibility = {
      importSpreadsheet: false,
      settings: false
    };

    // noinspection JSUnusedGlobalSymbols
    mounted() {
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

    get records(): Array<Record> {
      return $records.records;
    }

    get settings(): Setting {
      return {
        gameMode: $settings.gameMode,
        answerTime: $settings.answerTime,
        numberOfRepeatQuestion: $settings.numberOfRepeatQuestion,
        numberOfQuestions: $settings.numberOfQuestions
      };
    }

    syncSpreadsheet(spreadsheetId: string) {
      this.dialogVisibility.importSpreadsheet = true;
      $spreadsheet.fetch(spreadsheetId);
    }

    deleteSpreadsheet() {
      $spreadsheet.DELETE();
    }

    navigateToGame(sheetId: string) {
      this.$router.push({ name: 'Quiz', params: { sheetId } })
    }

    handleSettings(value: Setting | null) {
      this.dialogVisibility.settings = false;

      if (value) {
        $settings.UPDATE(value);
      }
    }
  }
</script>
