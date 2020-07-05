<template>
  <el-dialog title="Settings" :visible="visible" :show-close="false">
    <el-form ref="form" :model="newSettings" label-width="160px">
      <el-form-item label="Mode">
        <el-radio-group v-model="newSettings.gameMode">
          <el-radio :label="GameMode.TRAINING"></el-radio>
          <el-tooltip class="item" effect="dark" content="Continue until you get the wrong answer" placement="top-start">
            <el-radio :label="GameMode.MARATHON"></el-radio>
          </el-tooltip>
          <el-radio :label="GameMode.EXAMINATION"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Answer time" v-if="newSettings.gameMode !== GameMode.TRAINING">
        <el-slider
          v-model="newSettings.answerTime"
          :min="3"
          :max="30"
          :format-tooltip="value => `${value} seconds`"
        ></el-slider>
      </el-form-item>
      <el-form-item label="Repeat question" v-if="newSettings.gameMode !== GameMode.TRAINING">
        <el-input-number
          v-model="newSettings.numberOfRepeatQuestion"
          :min="1"
          :max="5"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="Number of questions" v-if="newSettings.gameMode === GameMode.EXAMINATION">
        <el-input-number
          v-model="newSettings.numberOfQuestions"
          :min="5"
          :max="50"
          :step="5"
        ></el-input-number>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close(false)">Cancel</el-button>
      <el-button type="primary" @click="close(true)">OK</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
  import {Component, Emit, Prop, Vue} from 'vue-property-decorator';
  import Setting from '@/entities/setting';
  import GameMode from '@/enums/gameMode';

  @Component
  export default class SettingsForm extends Vue {
    private readonly GameMode = GameMode

    @Prop() private readonly visible!: boolean;
    @Prop() private readonly settings!: Setting;

    private newSettings: Setting = Object.assign({}, this.settings);

    @Emit()
    close(updateRequired: boolean): Setting | null {
      return updateRequired ? this.newSettings : null;
    }
  }
</script>
