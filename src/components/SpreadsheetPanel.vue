<template>
  <div class="header">
    <div>
      Google Spreadsheet url
    </div>
    <div class="spreadsheet-url">
      <el-input
        v-model="newSheetUrl"
        :readonly="spreadsheetUrl !== null"
        placeholder="https://docs.google.com/spreadsheets/d/abcdefghijklmnopqrstuvwxyz1234567890/edit#gid=0"
        @input="validate"
      ></el-input>
    </div>
    <div v-if="spreadsheetUrl === null">
      <el-tooltip
        v-if="malformed"
        class="item"
        effect="dark"
        content="Input url is not Google Spreadsheet url."
        placement="top"
      >
        <el-button disabled>Sync</el-button>
      </el-tooltip>
      <el-button v-else type="primary" @click="checkSync">Sync</el-button>
    </div>
    <div v-else>
      <el-button @click="checkSync" class="button-margin-right"
        >Re-Sync</el-button
      >
      <el-popconfirm
        title="All data will be lost. This operation cannot be undone. Do you really continue?"
        confirm-button-text="Delete"
        confirm-button-type="danger"
        cancel-button-text="Cancel"
        icon="el-icon-info"
        icon-color="red"
        @onConfirm="truncate"
      >
        <el-button slot="reference" type="danger">Delete</el-button>
      </el-popconfirm>
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Component, Prop, Emit, Vue } from "vue-property-decorator";

dayjs.extend(relativeTime);

@Component
export default class SpreadsheetPanel extends Vue {
  @Prop() private readonly spreadsheetUrl!: string | null;

  private newSheetUrl: string = this.spreadsheetUrl ?? "";
  private malformed = false;

  extractSpreadsheetId(url: string): string | null {
    const result = url.match(
      /^https:\/\/docs.google.com\/spreadsheets\/d\/([^/]+)\/.*$/
    );
    return (result ?? [null, null])[1];
  }

  validate(url: string) {
    this.malformed = this.extractSpreadsheetId(url) === null;
  }

  checkSync() {
    const spreadsheetId = this.extractSpreadsheetId(this.newSheetUrl);
    if (spreadsheetId) {
      this.sync(spreadsheetId);
    }
  }

  @Emit()
  sync(value: string) {
    return value;
  }

  @Emit()
  truncate() {
    return null;
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}
.spreadsheet-url {
  flex: auto;
  margin-left: 1rem;
  margin-right: 2rem;
}
.button-margin-right {
  margin-right: 10px;
}
</style>
