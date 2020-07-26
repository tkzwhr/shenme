export type GameMode = "EXAMINATION" | "TRAINING";

export const GameModeEnum: { [key in GameMode]: key } = {
  EXAMINATION: "EXAMINATION",
  TRAINING: "TRAINING"
};
