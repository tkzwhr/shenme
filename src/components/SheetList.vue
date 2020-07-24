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
      <b-table-column field="learningTime" label="Learning Time" numeric>
        <template v-if="!props.row.loading">
          {{ props.row.learningTime | time }}
        </template>
      </b-table-column>
      <b-table-column field="answeredCount" label="Answered Count" numeric>
        <template v-if="!props.row.loading">
          {{ props.row.answered ? props.row.answered : "-" }}
        </template>
      </b-table-column>
      <b-table-column
        field="correctRate"
        label="Correct Rate of Latest 50"
        numeric
      >
        <template
          v-if="
            !props.row.loading &&
              props.row.correctRate &&
              props.row.answered < 50
          "
        >
          <b-tooltip
            type="is-warning"
            label="The number of answers less than 50"
          >
            <b-icon icon="alert-circle" size="is-small"></b-icon>
          </b-tooltip>
          {{ props.row.correctRate | percentage }}
        </template>
        <template v-else-if="!props.row.loading && props.row.correctRate">
          {{ props.row.correctRate | percentage }}
        </template>
        <template v-else-if="!props.row.loading">-</template>
      </b-table-column>
      <b-table-column field="maxChained" label="Max Chained Count" numeric>
        <template v-if="!props.row.loading">
          {{ props.row.maxChained ? props.row.maxChained : "-" }}
        </template>
      </b-table-column>
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { SheetListRowView } from "@/components/views.type";
import { percentage, time } from "@/filters";

@Component({
  filters: { time, percentage }
})
export default class SheetList extends Vue {
  @Prop() private readonly sheets!: Array<SheetListRowView>;

  @Emit() select(sheetId: string): string {
    return sheetId;
  }
}
</script>
