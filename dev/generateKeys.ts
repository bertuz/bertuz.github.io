import { JWK } from 'node-jose';

import * as fs from 'fs';

const keyStore = JWK.createKeyStore();

keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' }).then((result) => {
  const props = {
    kid: 'encrypt1',
    alg: 'RSA-OAEP',
    use: 'enc',
    enc: 'A256GCM',
  };

  keyStore.generate('RSA', 2048, props).then(function (result) {
    // {result} is a jose.JWK.Key
    // key = result;
    fs.writeFileSync(
      __dirname + '/keys.json',
      JSON.stringify(keyStore.toJSON(true))
    );
  });
});
