export type QuestionMode = "NORMAL" | "ONLY_FRONT" | "AT_RANDOM";

export const QuestionModeEnum: { [key in QuestionMode]: key } = {
  NORMAL: "NORMAL",
  ONLY_FRONT: "ONLY_FRONT",
  AT_RANDOM: "AT_RANDOM"
};
