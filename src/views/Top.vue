<template>
  <div class="a-container">
    <spreadsheet-panel
      class="spreadsheet-panel"
      :url="url"
      :validator="/^https:\/\/docs.google.com\/spreadsheets\/d\/([^/]+)\/.*$/"
      @sync="syncWithSpreadsheet"
      @unlink="confirmToUnlinkSpreadsheet"
    ></spreadsheet-panel>
    <sheet-list
      v-if="url"
      :sheets="sheets"
      @select="navigateToGame"
    ></sheet-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import $spreadsheet from "@/store/spreadsheet";
import $sheetStatistics from "@/store/sheetStatistics";
import $dailyStatistics from "@/store/dailyStatistics";
import * as SheetListRowTranslator from "@/view-translator/sheetListRow";
import SpreadsheetPanel from "@/components/SpreadsheetPanel.vue";
import SheetList from "@/components/SheetList.vue";
import SettingModal from "@/components/Settings.modal.vue";
import { SheetListRowView } from "@/components/views.type";

@Component({
  components: {
    SpreadsheetPanel,
    SheetList,
    SettingModal
  }
})
export default class Top extends Vue {
  private readonly spreadsheet$ = $spreadsheet;
  private readonly sheetStatistics$ = $sheetStatistics;
  private readonly dailyStatistics$ = $dailyStatistics;

  get url(): string | null {
    return this.spreadsheet$.url;
  }
  get sheets(): Array<SheetListRowView> {
    return this.spreadsheet$.sheets.map(s =>
      SheetListRowTranslator.modelToView(s, this.sheetStatistics$.items)
    );
  }

  // noinspection JSUnusedGlobalSymbols
  mounted() {
    if (typeof this.$route.query.error === "string") {
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$route.query.error,
        type: "is-danger"
      });
      this.$router.replace({ name: "Top" });
    }
  }

  navigateToGame(sheetId: string) {
    this.$router.push({ name: "Quiz", params: { sheetId } });
  }

  async syncWithSpreadsheet(spreadsheetId: string) {
    await this.spreadsheet$.fetch(spreadsheetId);
  }

  confirmToUnlinkSpreadsheet() {
    this.$buefy.dialog.confirm({
      title: "Unlink spreadsheet",
      message:
        "Are you sure you want to unlink your spreadsheet? <b>All records</b> will be deleted and this action cannot be undone.",
      confirmText: "Unlink",
      type: "is-danger",
      hasIcon: true,
      onConfirm: () => {
        this.spreadsheet$.DELETE();
        this.sheetStatistics$.DELETE();
        this.dailyStatistics$.DELETE();
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.spreadsheet-panel {
  margin-top: 2rem;
}
</style>
