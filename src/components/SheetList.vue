<template>
  <el-table
    v-if="visible && spreadsheet.url !== null"
    :data="spreadsheet.sheets"
    height="30vh"
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
        <a v-else href="#" @click="e => navigateToGame(e, scope.row.sheetId)">{{scope.row.sheetName}}</a>
      </template>
    </el-table-column>
    <el-table-column
      label="Number of Words"
      prop="words.length"
      align="right"
    ></el-table-column>
    <el-table-column
      align="right"
      label="Played Count"
    >
      <template slot-scope="scope">
        {{playedCount(scope.row.sheetId)}}
      </template>
    </el-table-column>
    <el-table-column
      align="right"
      label="Accuracy"
    >
      <template slot-scope="scope">
        {{accuracy(scope.row.sheetId)}} %
      </template>
    </el-table-column>
    <el-table-column
      align="right"
      label="Chained Count"
    >
      <template slot-scope="scope">
        {{chainedCount(scope.row.sheetId)}}
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
  import {SpreadsheetState} from '@/store/spreadsheet';
  import Record from '@/entities/record';

  @Component
  export default class SheetList extends Vue {
    @Prop() private readonly visible!: boolean;
    @Prop() private readonly spreadsheet!: SpreadsheetState;
    @Prop() private readonly records!: Array<Record>;

    playedCount(sheetId: string): string {
      const record = this.records.find(t => t.sheetId === sheetId);
      return record ? record.playedCount.toString() : "0";
    }

    accuracy(sheetId: string): string {
      const record = this.records.find(t => t.sheetId === sheetId);
      return record?.accuracy ? (record.accuracy * 100).toString() : "-";
    }

    chainedCount(sheetId: string): string {
      const record = this.records.find(t => t.sheetId === sheetId);
      return record?.chainedCount ? record.chainedCount.toString() : "-";
    }

    @Emit()
    navigateToGame(e: MouseEvent, sheetId: string) {
      e.preventDefault();
      return sheetId;
    }
  }
</script>

<style>
  /* noinspection CssUnusedSymbol */
  .custom-icon {
    font-size: 10vh;
  }
</style>
