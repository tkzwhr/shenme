import {
  Mutation,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";
import Record from "@/entities/record";

export interface RecordsState {
  records: Array<Record>;
}

@Module({
  dynamic: true,
  store,
  name: "records",
  namespaced: true,
  preserveState: localStorage.getItem("vuex") !== null
})
class Records extends VuexModule implements RecordsState {
  records: Array<Record> = [];

  @Mutation
  UPDATE_ACCURACY(data: { sheetId: string; newAccuracy: number }) {
    const record = this.records.find(t => t.sheetId === data.sheetId);
    if (record) {
      record.playedCount += 1;
      record.accuracy = data.newAccuracy;
    } else {
      this.records.push({
        sheetId: data.sheetId,
        playedCount: 1,
        accuracy: data.newAccuracy,
        chainedCount: null
      });
    }
  }

  @Mutation
  UPDATE_CHAINED_COUNT(data: { sheetId: string; newChainedCount: number }) {
    const record = this.records.find(t => t.sheetId === data.sheetId);
    if (record) {
      record.playedCount += 1;
      record.chainedCount = Math.max(
        record.chainedCount ?? 0,
        data.newChainedCount
      );
    } else {
      this.records.push({
        sheetId: data.sheetId,
        playedCount: 1,
        accuracy: null,
        chainedCount: data.newChainedCount
      });
    }
  }

  @Mutation
  DELETE() {
    this.records = [];
  }
}

const $records = getModule(Records, store);
export default $records;
