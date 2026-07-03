export const STAGE_LABELS = [
  {
    title: "Login",
    shortTitle: "Login",
    description: "",
  },
  {
    title: "Select a Card",
    shortTitle: "Select Card",
    description: "You will be able to customize your card in future steps.",
  },
  {
    title: "Modify Card Parameters",
    shortTitle: "Modify Parameters",
    description: "",
  },
  {
    title: "Choose a Theme",
    shortTitle: "Select Theme",
    description: "",
  },
  {
    title: "Display your Card",
    shortTitle: "Display Card",
    description:
      "Display the finished card on GitHub, Twitter/X, LinkedIn, or anywhere else!",
  },
] as const satisfies Array<{
  title: string;
  shortTitle: string;
  description: string;
}>;

export type StageIndex = {
  [K in keyof typeof STAGE_LABELS]: K extends `${infer N extends number}`
    ? N
    : never;
}[keyof typeof STAGE_LABELS];
