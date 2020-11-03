import React from 'react';
import { css } from '@emotion/core';
import AppBar from './AppBar';

const Gutters = ({ children }) => (
  <div
    css={css`
    margin: 0 auto;
    max-width: 700px;
  `}
  >
    {children}
  </div>
);

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
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </Gutters>
  </div>
);

export default Layout;
