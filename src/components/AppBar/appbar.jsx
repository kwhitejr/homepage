import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';

import useStyles from './styles';

export default function PrimarySearchAppBar() {
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
    <Typography color="inherit" className={classes.title} variant="h5" noWrap>
      kwhitejr
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
      </AppBar>
      {renderMobileMenu}
    </div>
  );
}
