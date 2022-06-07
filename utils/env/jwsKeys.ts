import localEnc from '../../env.local.enc.json';
import prodEnc from '../../env.prod.enc.json';

import crypto from 'crypto';

export default () => {
  const algorithm = 'aes-128-cbc';
  const decipher = crypto.createDecipheriv(
    algorithm,
    process.env.SERVICE_ENCRYPTION_KEY ?? '',
    process.env.SERVICE_ENCRYPTION_IV ?? ''
  );

  const encryptedKeys =
    process.env.ENVIRONMENT ?? 'dev' === 'dev' ? localEnc : prodEnc;

  let decrypted = decipher.update(encryptedKeys.enc, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
};
