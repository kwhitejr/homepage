import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '../AppBar';

const useStyles = makeStyles((theme) => ({
  gutter: {
    margin: '0 auto',
    maxWidth: '700px',
  },
}));

const Gutters = ({ children }) => {
  const classes = useStyles();
  return (
    <div className={classes.gutter}>
      {children}
    </div>
  );
};

const Layout = ({ children }) => (
  <div>
    <AppBar />
    <Gutters>
      <main>{children}</main>
      <footer>
        ©
        {' '}
        {new Date().getFullYear()}
        , Built with
        {' '}
        Gatsby
      </footer>
    </Gutters>
  </div>
);

export default Layout;
