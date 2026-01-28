export const STAGE_LABELS = [
  {
    title: "Login",
    shortTitle: "Login",
  },
  {
    title: "Select a Card",
    shortTitle: "Select Card",
  },
  {
    title: "Modify Card Parameters",
    shortTitle: "Modify Parameters",
  },
  {
    title: "Choose a Theme",
    shortTitle: "Select Theme",
  },
  {
    title: "Display your Card",
    shortTitle: "Display Card",
  },
] as const satisfies Array<{ title: string; shortTitle: string }>;

export type StageIndex = {
  [K in keyof typeof STAGE_LABELS]: K extends `${infer N extends number}`
    ? N
    : never;
}[keyof typeof STAGE_LABELS];
