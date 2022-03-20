import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { params } = req.query;
  console.log(params);
  res.status(200).json(params);
}
