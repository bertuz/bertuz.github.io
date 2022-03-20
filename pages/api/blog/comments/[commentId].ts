import { Comment, comments } from "../../../../data/comments";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Comment | { error: string }>
) {
  if (req.method === "GET") {
    const { commentId } = req.query;
    const comment = comments.find((comment) => comment.id === commentId);
    if (comment !== undefined) {
      res.status(200).json(comment);
    } else {
      res.status(404).json({ error: "not found" });
    }
  } else if (req.method === "DELETE") {
    const { commentId } = req.query;
    const indexToDelete = comments.findIndex(
      (comment) => comment.id === commentId
    );
    const deletedComments = comments.splice(indexToDelete, 1);

    res.status(200).json(deletedComments[0]);
  }
}
