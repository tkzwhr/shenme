<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Settings</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Learning Language">
        <b-field>
          <b-select
            v-model="newSettings.learningLanguage"
            placeholder="Select a learning language"
          >
            <option
              v-for="lang in languages"
              :key="lang.name"
              :value="lang.lang"
              >{{ lang.name }}</option
            >
          </b-select>
        </b-field>
      </b-field>

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

      <b-field label="Question Mode" :message="questionModeDescription">
        <b-field>
          <b-radio-button
            v-model="newSettings.questionMode"
            :native-value="QuestionModeEnum.NORMAL"
          >
            Normal
          </b-radio-button>
          <b-radio-button
            v-model="newSettings.questionMode"
            :native-value="QuestionModeEnum.ONLY_FRONT"
          >
            Only front
          </b-radio-button>
          <b-radio-button
            v-model="newSettings.questionMode"
            :native-value="QuestionModeEnum.AT_RANDOM"
          >
            At random
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
import { Language, SettingsView } from "@/components/views.type";
import { GameModeEnum } from "@/enums/gameMode";
import { QuestionMode, QuestionModeEnum } from "@/enums/questionMode";

@Component
export default class SettingsModal extends Vue {
  private readonly GameModeEnum = GameModeEnum;
  private readonly QuestionModeEnum = QuestionModeEnum;

  get questionModeDescription(): string | undefined {
    switch (this.newSettings.questionMode as QuestionMode) {
      case "NORMAL":
        break;
      case "ONLY_FRONT":
        return "Options also are from 'Front'.";
      case "AT_RANDOM":
        return "At each question it is decided that options are from 'Front' or 'Back'.";
    }
    return undefined;
  }

  @Prop() private readonly settings!: SettingsView;
  @Prop() private readonly languages!: Array<Language>;

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
