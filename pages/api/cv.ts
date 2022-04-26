import useragent from 'express-useragent';

import fs from 'fs';
import path from 'path';

import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const source = req.headers['user-agent'];
  const contentType =
    source && !useragent.parse(source).isMobile
      ? 'application/octet-stream'
      : 'application/pdf';

  const cvFile = path.resolve('./public/cv.pdf');
  const stat = fs.statSync(cvFile);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Content-Disposition':
      'attachment; filename=Curriculum-Matteo-Bertamini.pdf',
  });

  const readStream = fs.createReadStream(cvFile);

  readStream.on('open', function () {
    readStream.pipe(res);
  });

  readStream.on('error', function (err) {
    res.end(err);
  });
}
