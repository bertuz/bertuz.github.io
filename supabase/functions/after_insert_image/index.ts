import { createClient } from 'jsr:@supabase/supabase-js@2';
import sizeOf from 'npm:buffer-image-size';

import { Buffer } from 'node:buffer';

const SUPABASE_DOMAIN = 'https://fpbswrebvsmjdwekyznx.supabase.co';
const IMAGES_URL = `${SUPABASE_DOMAIN}/storage/v1/object/public/photos`;

Deno.serve(async (req) => {
  const { 'new-image': image } = await req.json();

  const { name: nameWithExtension, id } = image;
  const name = nameWithExtension.replace(/\.[a-zA-Z0-9]{1,3}$/, '');
  const url = `${IMAGES_URL}/${nameWithExtension}`;
  const contentImage = await fetch(url, {
    method: 'GET',
  });
  const imageBuffer = Buffer.from(await contentImage.arrayBuffer());
  const imageSize = sizeOf(imageBuffer);

  const dataToSend = {
    id,
    url,
    height: imageSize.height,
    width: imageSize.width,
    name,
  };
  console.log(dataToSend);
  console.log(req.headers.get('Authorization'));

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    }
  );

  const { data, error } = await supabaseClient
    .from('gallery-images')
    .insert(dataToSend);
  console.log(data);
  console.log(error);
  console.log(` inserted image data ${data}, error (if any): ${error}`);

  return new Response(JSON.stringify('Gotcha'), {
    headers: { 'Content-Type': 'application/json' },
  });
});
