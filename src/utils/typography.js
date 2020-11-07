import Typography from 'typography';
import fairyGatesTheme from 'typography-theme-fairy-gates';

// eslint-disable-next-line no-unused-vars
fairyGatesTheme.overrideThemeStyles = ({ rhythm }, options) => ({
  '@media only screen and (max-width:480px)': {
    main: {
      marginLeft: rhythm(1),
      marginRight: rhythm(1),
    },
  },
});

const typography = new Typography(fairyGatesTheme);

export default typography;
