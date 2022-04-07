import colors from '../assets/styles/colors';
import { dimensionInRem } from '../assets/styles/dimensions';

import { css } from '@emotion/react';

const getClasses = () => ({
  cvExperienceItem: css({
    paddingTop: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'justify',
    textjustify: 'inter-word',
    hyphens: 'auto',
  }),
  cvExperienceItemHeader: css({
    flex: '0 0 150px',
    paddingRight: '1rem',
    textAlign: 'right',
    fontFamily: 'Alegreya-Sans SC',
    ['@media (max-width: 1235px)']: {
      textAlign: 'left',
    },
  }),
  cvExperienceCompany: css({ fontSize: dimensionInRem(1) }),
  footer: css({
    display: 'block',
    backgroundColor: colors.senape,
  }),
  cvExperienceDescription: css({
    flex: '1 0 400px',
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
});

type CVExperienceItemProperties = {
  commpanyName: string;
  experienceDates: string;
  children: React.ReactNode;
};
const CVExperienceItem = ({
  children,
  commpanyName,
  experienceDates,
}: CVExperienceItemProperties) => {
  const classes = getClasses();

  return (
    <div css={classes.cvExperienceItem}>
      <div css={classes.cvExperienceItemHeader}>
        <span css={classes.cvExperienceCompany}>{commpanyName}</span>
        <br />
        {experienceDates}
      </div>
      <div css={classes.cvExperienceDescription}>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default CVExperienceItem;
