import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import TopPage from "@/views/TopPage.vue";
import ExamPage from "@/views/ExamPage.vue";
import TrainingPage from "@/views/TrainingPage.vue";
import StatisticsPage from "@/views/StatisticsPage.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Top",
    component: TopPage
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: StatisticsPage
  },
  {
    path: "/training/:sheetId",
    name: "Training",
    component: TrainingPage
  },
  {
    path: "/exam/:sheetId",
    name: "Exam",
    component: ExamPage
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
