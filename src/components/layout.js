import React from 'react';
import { Link } from 'gatsby';
import { css } from '@emotion/core';
import { rhythm } from '../utils/typography';
import AppBar from './AppBar';

const Layout = ({ title, children }) => {
  const header = (
    <h1>
      {title}
    </h1>
  );

  return (
    <div>
      <AppBar />
      <div
        css={css`
        margin: 0 auto;
        max-width: 700px;
        padding: ${rhythm(2)};
        padding-top: ${rhythm(1.5)};
      `}
      >
        <header>{header}</header>
        <main>{children}</main>
        <footer>
          ©
          {' '}
          {new Date().getFullYear()}
          , Built with
          {' '}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
