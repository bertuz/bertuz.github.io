import { dimensionInRem } from '../assets/styles/dimensions';

import useDimensions from '../utils/useDimensions';

import { css } from '@emotion/react';
import { useMemo, useRef } from 'react';

const getClasses = () => {
  return {
    cvExperienceItem: css({
      paddingTop: '1rem',
      display: 'flex',
      flexWrap: 'wrap',
      textAlign: 'justify',
      textJustify: 'inter-word',
      hyphens: 'auto',
    }),
    cvExperienceItemHeader: css({
      boxSizing: 'border-box',
      flex: '0 0 150px',
      textAlign: 'right',
      fontFamily: '"Alegreya-Sans SC", sans-serif',
    }),
    cvExperienceItemHeaderStacked: css({ textAlign: 'left' }),
    cvExperienceItemHeaderHidden: css({
      ['@media (max-width: 1095px)']: {
        display: 'none',
      },
    }),
    cvExperienceCompany: css({ fontSize: dimensionInRem(2) }),
    cvExperienceDescription: css({
      boxSizing: 'border-box',
      paddingLeft: '1rem',
      flex: '1 1 350px',

      '& > div': {
        maxWidth: 614,
      },
    }),
    cvExperienceDescriptionWithoutPadding: {
      paddingLeft: 0,
    },
  };
};

type CVExperienceItemProperties = {
  headerInfo?: {
    companyName: string;
    experienceDates: string;
  };
  children: React.ReactNode;
};

const CVExperienceItem = ({
  headerInfo,
  children,
}: CVExperienceItemProperties) => {
  const classes = useMemo(() => {
    return getClasses();
  }, []);
  const cvExperienceItemRef = useRef(null);
  const { width } = useDimensions(cvExperienceItemRef);
  const headerClasses = useMemo(() => {
    return [
      classes.cvExperienceItemHeader,
      headerInfo === undefined && (width ?? 0) < 500
        ? classes.cvExperienceItemHeaderHidden
        : null,
      (width ?? 0) < 500 ? classes.cvExperienceItemHeaderStacked : null,
    ];
  }, [width, headerInfo]);
  const cvExperienceDescriptionClasses = useMemo(() => {
    return [
      classes.cvExperienceDescription,
      (width ?? 0) < 500 ? classes.cvExperienceDescriptionWithoutPadding : null,
    ];
  }, [
    classes.cvExperienceDescription,
    classes.cvExperienceDescriptionWithoutPadding,
    width,
  ]);

  return (
    <div css={classes.cvExperienceItem} ref={cvExperienceItemRef}>
      <div css={headerClasses}>
        <span css={classes.cvExperienceCompany}>{headerInfo?.companyName}</span>
        <br />
        {headerInfo?.experienceDates}
      </div>
      <div css={cvExperienceDescriptionClasses}>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default CVExperienceItem;
