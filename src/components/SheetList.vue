<template>
  <b-table :data="sheets" striped narrowed mobile-cards>
    <template slot-scope="props">
      <b-table-column field="sheetName" label="Sheet Name">
        <span v-if="props.row.error">
          {{ props.row.sheetName }}
          <b-tag type="is-warning">
            <b-icon icon="alert-circle" size="is-small"></b-icon>
            {{ props.row.error }}
          </b-tag>
        </span>
        <template v-else>
          <a
            href="#"
            @click="
              e => {
                e.preventDefault();
                select(props.row.sheetId);
              }
            "
          >
            {{ props.row.sheetName }}
          </a>
          <b-icon v-if="props.row.loading" icon="sync" size="is-small"></b-icon>
        </template>
      </b-table-column>
      <b-table-column field="numOfWords" label="Number of Words" numeric>
        <template v-if="!props.row.loading">
          {{ props.row.numOfWords }}
        </template>
      </b-table-column>
      <b-table-column field="playCount" label="Play Count" numeric>
        <template v-if="!props.row.loading">
          {{ props.row.playCount }}
        </template>
      </b-table-column>
      <b-table-column field="accuracy" label="Accuracy" numeric>
        <template v-if="!props.row.loading">
          {{
            props.row.accuracy
              ? Math.floor(props.row.accuracy * 1000) / 10
              : "-"
          }}
          %
        </template>
      </b-table-column>
      <b-table-column field="chainedCount" label="Chained Count" numeric>
        <template v-if="!props.row.loading">
          {{ props.row.chainedCount ? props.row.chainedCount : "-" }}
        </template>
      </b-table-column>
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { SheetListRowView } from "@/components/views.type";

@Component
export default class SheetList extends Vue {
  @Prop() private readonly sheets!: Array<SheetListRowView>;

  @Emit() select(sheetId: string): string {
    return sheetId;
  }
}
</script>
