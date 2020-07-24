<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Settings</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Game Mode">
        <b-field>
          <b-radio-button
            v-model="newSettings.gameMode"
            :native-value="GameModeEnum.EXAMINATION"
          >
            Examination
          </b-radio-button>
          <b-radio-button
            v-model="newSettings.gameMode"
            :native-value="GameModeEnum.TRAINING"
          >
            Training
          </b-radio-button>
        </b-field>
      </b-field>

      <b-field label="Answer time">
        <b-slider
          v-model="newSettings.answerTime"
          :min="3"
          :max="30"
          :disabled="newSettings.gameMode === GameModeEnum.TRAINING"
        ></b-slider>
      </b-field>

      <b-field label="Limit to listen">
        <b-numberinput
          v-model="newSettings.limitToListen"
          :min="1"
          :max="5"
          :disabled="newSettings.gameMode === GameModeEnum.TRAINING"
          :editable="false"
        ></b-numberinput>
      </b-field>

      <b-field label="Number of questions">
        <b-numberinput
          v-model="newSettings.numOfQuestions"
          :min="5"
          :max="100"
          :step="5"
          :disabled="newSettings.gameMode === GameModeEnum.TRAINING"
          :editable="false"
        ></b-numberinput>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="close">Cancel</button>
      <button
        class="button is-primary"
        @click="
          () => {
            close();
            apply();
          }
        "
      >
        Apply
      </button>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from "vue-property-decorator";
import { SettingsView } from "@/components/views.type";
import { GameModeEnum } from "@/enums/gameMode";

@Component
export default class SettingsModal extends Vue {
  private readonly GameModeEnum = GameModeEnum;

  @Prop() private readonly settings!: SettingsView;

  @Emit() apply(): SettingsView {
    return this.newSettings;
  }

  private newSettings = Object.assign({}, this.settings);

  close() {
    (this.$parent as any).close();
  }
}
</script>

<style lang="scss" scoped>
.modal-card {
  width: auto;
}
</style>
