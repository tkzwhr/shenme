import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Top from "@/views/Top.vue";
import Quiz from "@/views/Quiz.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Top",
    component: Top
  },
  {
    path: "/quiz/:sheetId",
    name: "Quiz",
    component: Quiz
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
