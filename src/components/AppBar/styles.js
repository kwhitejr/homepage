import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  appbar: {
    background: '#4a8b9e', // link color: 4a9e86
  },
  title: {
    fontFamily: 'Work Sans,sans-serif',
    display: 'absolute',
    marginRight: theme.spacing(1),
  },
  actionsDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  actionsMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  button: {
    fontFamily: 'Work Sans,sans-serif',
    margin: theme.spacing(2),
  },
}));

export default useStyles;
