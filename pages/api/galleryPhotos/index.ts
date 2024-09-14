import sizeOf from 'buffer-image-size';

import type { NextApiRequest, NextApiResponse } from 'next';

type SupabaseStorageQueryResponse = ReadonlyArray<{
  name: string;
}>;

const SUPABASE_PUBLIC_KEY = process.env.SUPABASE_PUBLIC_KEY || ' ';
const SUPABASE_HEADERS = new Headers({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
  apikey: SUPABASE_PUBLIC_KEY,
});

type ResponseData = ReadonlyArray<{
  contentProperties: { image: { height: number; width: number } };
  url: string;
  name: string;
}>;

export async function getImageData(): Promise<ResponseData> {
  const requestOptions = {
    method: 'POST',
    headers: SUPABASE_HEADERS,
    body: JSON.stringify({
      prefix: '',
      limit: 20,
      offset: 0,
      sortBy: {
        column: 'created_at',
        order: 'desc',
      },
      search: '',
    }),
  };

  const SUPABASE_DOMAIN = process.env.SUPABASE_DOMAIN || '';
  const IMAGES_OBJECTS_URL = `${SUPABASE_DOMAIN}/storage/v1/object/list/photos`;
  const IMAGES_URL = `${SUPABASE_DOMAIN}/storage/v1/object/public/photos`;
  const images = (await fetch(IMAGES_OBJECTS_URL, requestOptions).then(
    (response) => response.json()
  )) as SupabaseStorageQueryResponse;

  const imagesToReturn = [];
  for (const image of images) {
    const { name: nameWithExtension } = image;
    const name = nameWithExtension.replace(/\.[a-zA-Z0-9]{1,3}$/, '');
    const url = `${IMAGES_URL}/${nameWithExtension}`;
    const contentImage = await fetch(url, {
      method: 'GET',
    });
    const imageBuffer = Buffer.from(await contentImage.arrayBuffer());
    const imageSize = sizeOf(imageBuffer);

    imagesToReturn.push({
      url,
      contentProperties: {
        image: { height: imageSize.height, width: imageSize.width },
      },
      name,
    });
  }

  return imagesToReturn;
}

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const imagesToReturn = await getImageData();
  res.status(200).json(imagesToReturn);
}
