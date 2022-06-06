import TextLink from '../../components/TextLink';

import type { AuthConfig } from '../../typings/next';

import type { NextPage } from 'next';

type LoginWithDifferentUserPage = NextPage & { auth?: AuthConfig };
const LoginWithDifferentUser: LoginWithDifferentUserPage = () => {
  return (
    <>
      <h1>Unauthorized</h1>
      <p>
        Sorry 🤓, only the admin can access this area!
        <br />{' '}
        <TextLink href="/" target="_self">
          Go back to the home page
        </TextLink>
      </p>
    </>
  );
};

LoginWithDifferentUser.auth = {
  scope: null,
};

export default LoginWithDifferentUser;
