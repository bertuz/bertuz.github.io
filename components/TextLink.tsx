import Extlink from '../public/external-link.svg';

import { dimensionInRem } from '../assets/styles/dimensions';

import Link from 'next/link';
import { useMemo } from 'react';
import { css } from '@emotion/react';

type TextLinkProperties = {
  href: string;
  children: React.ReactNode;
};

const getClasses = () => ({
  externalLinkIcon: css({
    height: dimensionInRem(-1),
    width: dimensionInRem(-1),
    display: 'inline-block',
    verticalAlign: 'middle',
    paddingLeft: '0.2rem',
  }),
});

const TextLink = ({ children, href }: TextLinkProperties) => {
  const classes = useMemo(() => {
    return getClasses();
  }, []);

  return (
    <Link href={href} prefetch={false}>
      <a target="_blank" rel="noreferrer">
        {children}
        <Extlink css={classes.externalLinkIcon} />
      </a>
    </Link>
  );
};

export default TextLink;
