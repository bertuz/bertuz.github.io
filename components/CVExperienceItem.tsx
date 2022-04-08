import colors from '../assets/styles/colors';
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
      textjustify: 'inter-word',
      hyphens: 'auto',
    }),
    cvExperienceItemHeader: css({
      boxSizing: 'border-box',
      flex: '0 0 150px',
      paddingRight: '1rem',
      textAlign: 'right',
      fontFamily: 'Alegreya-Sans SC',
    }),
    cvExperienceItemHeaderStacked: css({ textAlign: 'left' }),
    cvExperienceItemHeaderHidden: css({
      ['@media (max-width: 1095px)']: {
        display: 'none',
      },
    }),
    cvExperienceCompany: css({ fontSize: dimensionInRem(1) }),
    footer: css({
      display: 'block',
      backgroundColor: colors.senape,
    }),
    cvExperienceDescription: css({
      boxSizing: 'border-box',
      flex: '1 0 350px',
      '& > div': {
        maxWidth: 614,
      },
    }),

    footerContent: css({
      textAlign: 'center',
      fontFamily: "'Alegreya', serif",
      textTransform: 'uppercase',
      margin: 0,
      padding: 24,
    }),
  };
};

type CVExperienceItemProperties = {
  headerInfo?: {
    companyName: string;
    experienceDates: string;
  };
  children: React.ReactNode;
};

// type CVExperienceItemProperties = { color: string };

const nclasses = () => {
  return {
    classTest: css({
      color: 'red',
    }),
    back: css({
      backgroundColor: 'white',
    }),
  };
};

const CVExperienceItem = ({
  headerInfo,
  children,
}: CVExperienceItemProperties) => {
  // const classes = nclasses();
  // const headerClasses = css([
  //   classes.classTest,
  //   headerInfo !== undefined ? classes.back : null,
  // ]);
  // return <div css={headerClasses}>hello</div>;
  const classes = getClasses();
  const cvExperienceItemRef = useRef(null);
  const { width } = useDimensions(cvExperienceItemRef);
  const headerClasses = useMemo(() => {
    console.log(headerInfo);
    return [
      classes.cvExperienceItemHeader,
      headerInfo !== undefined ? null : classes.cvExperienceItemHeaderHidden,
      (width ?? 0) < 500 ? classes.cvExperienceItemHeaderStacked : null,
    ];
  }, [width, headerInfo]);

  return (
    <div css={classes.cvExperienceItem} ref={cvExperienceItemRef}>
      <div css={headerClasses}>
        <span css={classes.cvExperienceCompany}>{headerInfo?.companyName}</span>
        <br />
        {headerInfo?.experienceDates}
      </div>
      <div css={classes.cvExperienceDescription}>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default CVExperienceItem;
