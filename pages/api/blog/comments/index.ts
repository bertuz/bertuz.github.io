import { Comments, comments } from "../../../../data/comments";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Comments | { error: string }>
) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unautheticated user" });
  }

  if (req.method === "GET") {
    res.status(200).json(comments);
  } else if (req.method === "POST") {
    const comment = req.body.comment as string;
    const newComment = {
      id: Date.now().toString(),
      text: comment,
    };

    comments.push(newComment);
  }
};

export default handler;
