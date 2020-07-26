<template>
  <div class="a-container">
    <statistics-table :data="dailyStatistics$.items"></statistics-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import StatisticsTable from "@/components/StatisticsTable.vue";
import $dailyStatistics from "@/store/dailyStatistics";
@Component({
  components: { StatisticsTable }
})
export default class StatisticsPage extends Vue {
  private readonly dailyStatistics$ = $dailyStatistics;
}
</script>
