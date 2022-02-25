// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {articles} from '../../../data';

type Data = Array<{
    id: string, title: string, excerpt: string, body: string
}> | {message: string};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const {id} = req.query;
    const filtered = articles.filter((article)=> article.id ===id)

    if(filtered.length > 0) {
        // @ts-ignore
        res.status(200).json(filtered[0]);
    }

    res.status(404).json({message: 'not found'});
}
