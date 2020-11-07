import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
import Slide from '@material-ui/core/Slide';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';

import useStyles from './styles';

function HideOnScroll(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({ target: window ? window() : undefined });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func, // eslint-disable-line
};

export default function PrimarySearchAppBar(props) {
  const classes = useStyles();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem className={classes.button}>
        <p>Articles</p>
      </MenuItem>
      <MenuItem className={classes.button}>
        <p>Code</p>
      </MenuItem>
      <MenuItem className={classes.button}>
        <p>About</p>
      </MenuItem>
    </Menu>
  );

  const renderTitle = (
    <Typography className={classes.title} variant="h5" noWrap>
      <Link
        to="/"
        className={classes.brandButton}
      >
        kwhitejr
      </Link>
    </Typography>
  );

  const renderActionsDesktop = (
    <div className={classes.actionsDesktop}>
      <Button className={classes.button} color="inherit">Articles</Button>
      <Button className={classes.button} color="inherit">Code</Button>
      <Button className={classes.button} color="inherit">About</Button>
    </div>
  );

  const renderActionsMobile = (
    <div className={classes.actionsMobile}>
      <IconButton
        aria-label="show more"
        aria-controls={mobileMenuId}
        aria-haspopup="true"
        onClick={handleMobileMenuOpen}
        color="inherit"
      >
        <MenuIcon />
      </IconButton>
    </div>
  );

  return (
    <div className={classes.grow}>
      <AppBar className={classes.appbar} position="static">
        <Toolbar>
          {renderTitle}
          <div className={classes.grow} />
          {renderActionsDesktop}
          {renderActionsMobile}
        </Toolbar>
        {renderMobileMenu}
      </AppBar>
    </div>
  );
}
