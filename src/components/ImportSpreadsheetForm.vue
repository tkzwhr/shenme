<template>
  <el-dialog
    title="Synchronizing with Google Spreadsheets..."
    :visible="visible"
    @close="close"
  >
    <el-alert
      v-if="spreadsheet.fetchingErrors.length > 0"
      type="error"
      :title="spreadsheet.fetchingErrors.join('\n')"
      :closable="false"
      show-icon
    >
    </el-alert>
    <el-table
      v-else
      v-loading="spreadsheet.fetching"
      :data="spreadsheet.sheets"
    >
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
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { SpreadsheetSheetState, SpreadsheetState } from "@/store/spreadsheet";

@Component
export default class ImportSpreadsheetForm extends Vue {
  @Prop() private readonly visible!: boolean;
  @Prop() private readonly spreadsheet!: SpreadsheetState;

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

  @Emit()
  close(): null {
    return null;
  }
}
</script>
