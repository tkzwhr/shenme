<template>
  <b-table
    :data="groupedData"
    detailed
    hoverable
    striped
    custom-detail-row
    detail-key="yearMonth"
    :show-detail-icon="true"
  >
    <template slot-scope="props">
      <b-table-column field="yearMonth" label="Date" width="300">
        <template>
          {{ props.row.yearMonth }}
          ({{ props.row.items.filter(t => t.learningTime > 0).length }})
        </template>
      </b-table-column>

      <b-table-column field="learningTime" label="Learning Time" numeric>
        {{ props.row.learningTime | time }}
      </b-table-column>

      <b-table-column field="answeredCount" label="Answered Count" numeric>
        {{ props.row.correct + props.row.incorrect }}
      </b-table-column>

      <b-table-column field="correctRate" label="Correct Rate" numeric>
        {{
          (props.row.correct / (props.row.correct + props.row.incorrect))
            | percentage
        }}
      </b-table-column>
    </template>

    <template slot="detail" slot-scope="props">
      <tr v-for="item in props.row.items" :key="item.date | date">
        <td></td>
        <td>
          {{ item.date | date }}
        </td>
        <template v-if="item.learningTime > 0">
          <td class="has-text-right">
            {{ item.learningTime | time }}
          </td>
          <td class="has-text-right">
            {{ item.correct + item.incorrect }}
          </td>
          <td class="has-text-right">
            {{ (item.correct / (item.correct + item.incorrect)) | percentage }}
          </td>
        </template>
        <template v-else>
          <td class="has-text-right">-</td>
          <td class="has-text-right">-</td>
          <td class="has-text-right">-</td>
        </template>
      </tr>
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DailyStatisticsView, GroupedDailyStatisticsView } from "./views.type";
import dayjs from "dayjs";
import { date, percentage, time } from "@/filters";

@Component({
  filters: { date, time, percentage }
})
export default class StatisticsTable extends Vue {
  // noinspection JSMismatchedCollectionQueryUpdate
  @Prop() private readonly data!: Array<DailyStatisticsView>;

  get normalizedData(): Array<DailyStatisticsView> {
    if (this.data.length === 0) {
      return [];
    }
    const sortedData = this.data.slice();

    sortedData.sort((a, b) => dayjs(a.date).diff(b.date));
    const begin = dayjs(sortedData[0].date).startOf("month");
    const end = dayjs(sortedData[sortedData.length - 1].date).endOf("month");

    for (
      let currentDate = begin;
      currentDate.isBefore(end);
      currentDate = currentDate.add(1, "day")
    ) {
      if (!sortedData.find(d => currentDate.isSame(d.date, "day"))) {
        sortedData.push({
          date: currentDate.toISOString(),
          learningTime: 0,
          correct: 0,
          incorrect: 0
        });
      }
    }

    sortedData.sort((a, b) => dayjs(b.date).diff(a.date));

    return sortedData;
  }

  get groupedData(): Array<GroupedDailyStatisticsView> {
    return this.normalizedData.reduce(
      (acc: Array<GroupedDailyStatisticsView>, v: DailyStatisticsView) => {
        const yearMonth = dayjs(v.date).format("YYYY-MM");
        const target = acc.find(a => a.yearMonth === yearMonth);
        if (target) {
          target.learningTime += v.learningTime;
          target.correct += v.correct;
          target.incorrect += v.incorrect;
          target.items.push(v);
        } else {
          acc.push({
            yearMonth,
            learningTime: v.learningTime,
            correct: v.correct,
            incorrect: v.incorrect,
            items: [v]
          });
        }
        return acc;
      },
      []
    );
  }
}
</script>
