export type Comment = {
  id: string;
  text: string;
};
export type Comments = Array<Comment>;

export const comments: Comments = [
  {
    id: "1",
    text: "lorem",
  },
  {
    id: "2",
    text: "ipsum",
  },
  {
    id: "3",
    text: "sin",
  },
];
