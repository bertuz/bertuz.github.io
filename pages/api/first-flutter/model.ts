export type Place = {
  id: number;
  name: string;
  url: string;
  facts: Array<{ title: string; text: string }>;
};
