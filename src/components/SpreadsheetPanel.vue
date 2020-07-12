<template>
  <section>
    <template v-if="url === null">
      <b-field
        label="Spreadsheet url"
        label-position="on-border"
        :type="isMalformed ? 'is-danger' : null"
      >
        <b-input
          v-model="editedUrl"
          placeholder="https://docs.google.com/spreadsheets/d/Abcdefghijklmnopqrstuvwxyz1234567890/edit"
          expanded
          @input="validate"
        ></b-input>
        <p class="control">
          <button
            class="button is-primary"
            :disabled="editedUrl.length === 0 || isMalformed"
            @click="sync"
          >
            Link and Sync
          </button>
        </p>
      </b-field>
      <p v-if="isMalformed" class="has-text-danger is-small">
        Input url is malformed
      </p>
    </template>
    <b-field v-else label="Spreadsheet url" label-position="on-border">
      <b-input
        readonly
        expanded
        icon-right="sync"
        icon-right-clickable
        @icon-right-click="sync"
        :value="url"
      ></b-input>
      <p class="control">
        <button class="button is-danger" @click="unlink">Unlink</button>
      </p>
    </b-field>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from "vue-property-decorator";

@Component
export default class SpreadsheetPanel extends Vue {
  @Prop() private readonly url!: string | null;
  @Prop() private readonly validator!: RegExp | null;

  @Emit() sync(): string | null {
    return this.spreadsheetId;
  }
  @Emit() unlink() {
    return;
  }

  private editedUrl = this.url ?? "";
  private isMalformed = false;

  get spreadsheetId(): string | null {
    const url = this.url ?? this.editedUrl;
    const result = this.validator && url.match(this.validator);
    return (result ?? [null, null])[1];
  }

  validate() {
    this.isMalformed = this.spreadsheetId === null;
  }
}
</script>

<style lang="scss" scoped>
.a-container {
  padding: 1rem;
}
</style>
