import Extlink from '../public/external-link.svg';

import { dimensionInRem } from '../assets/styles/dimensions';

import Link from 'next/link';
import { useMemo } from 'react';
import { css } from '@emotion/react';

type TextLinkProperties = {
  href: string;
  children: React.ReactNode;
  target?: '_blank' | '_self';
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

const TextLink = ({
  children,
  href,
  target = '_blank',
}: TextLinkProperties) => {
  const classes = useMemo(() => {
    return getClasses();
  }, []);

  return (
    <Link href={href} prefetch={false}>
      <a target={target} rel="noreferrer">
        {children}
        <Extlink css={classes.externalLinkIcon} />
      </a>
    </Link>
  );
};

export default TextLink;
