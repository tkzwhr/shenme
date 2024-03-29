<template>
  <div>
    <nav-bar
      :title="title"
      @statistics="navigateToStatistics"
      @settings="showSettingsModal"
      @back="$router.back()"
    ></nav-bar>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import $settings from "@/store/settings";
import $spreadsheet from "@/store/spreadsheet";
import * as SettingTranslator from "@/view-translator/settings";
import NavBar from "@/components/NavBar.vue";
import SettingModal from "@/components/Settings.modal.vue";
import { Language, SettingsView } from "@/components/views.type";

Component.registerHooks([
  "beforeRouteEnter",
  "beforeRouteUpdate",
  "beforeRouteLeave"
]);

@Component({
  components: {
    NavBar
  }
})
export default class App extends Vue {
  private readonly settings$ = $settings;
  private readonly spreadsheet$ = $spreadsheet;

  private languages: Array<Language> = [];

  get title(): string {
    const sheetId = this.$route.params.sheetId as string | undefined;
    const spreadsheet = this.spreadsheet$.sheets.find(
      t => t.sheetId === sheetId
    );
    return spreadsheet?.sheetName ?? "";
  }
  get settings(): SettingsView {
    return SettingTranslator.modelToView(this.settings$);
  }

  // noinspection JSUnusedGlobalSymbols
  mounted() {
    this.loadVoices();
  }

  navigateToStatistics() {
    this.$router.push({ name: "Statistics" });
  }

  showSettingsModal() {
    // noinspection JSUnusedGlobalSymbols
    this.$buefy.modal.open({
      parent: this,
      component: SettingModal,
      hasModalCard: true,
      trapFocus: true,
      props: {
        settings: this.settings,
        languages: this.languages
      },
      events: {
        apply: (newSetting: SettingsView) => {
          const model = SettingTranslator.viewToModel(newSetting);
          if (model) {
            this.settings$.UPDATE(model);
          }
        }
      }
    });
  }

  private loadVoices() {
    this.languages.push(
      ...window.speechSynthesis
        .getVoices()
        .map(v => ({ name: v.name, lang: v.lang }))
    );
    // For chrome
    window.speechSynthesis.onvoiceschanged = () => {
      this.languages.length = 0;
      this.languages.push(
        ...window.speechSynthesis
          .getVoices()
          .map(v => ({ name: v.name, lang: v.lang }))
      );
    };
  }
}
</script>

<style lang="scss">
.a-container {
  padding: 1rem;

  > * {
    margin-bottom: 1rem;

    & :last-child {
      margin-bottom: 0;
    }
  }
}
</style>
