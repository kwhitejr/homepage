/* eslint-disable react/prop-types */
import React from 'react';
import { graphql } from 'gatsby';
import { Link } from 'gatsby-theme-material-ui';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import kebabCase from 'lodash.kebabcase';

import Bio from '../components/Bio';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const useStyles = makeStyles((theme) => ({
  tagLink: {
    all: 'revert',
    backgroundImage: 'none',
  },
  tagChip: {
    textDecoration: 'none',
  },
}));

const BlogPostTemplate = ({ data, location }) => {
  const classes = useStyles();
  const post = data.markdownRemark;
  const siteTitle = data.site.siteMetadata?.title || 'Title';

  const {
    excerpt,
    frontmatter: {
      title, description, date, tags,
    },
    html,
  } = post;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={title}
        description={description || excerpt}
      />
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{title}</h1>
          <p>{date}</p>
          {tags ? (
            <div className="tags-container">
              <ul className="taglist">
                {tags.map((tag) => (
                  <li key={`${tag}tag`}>
                    <Link
                      to={`/tags/${kebabCase(tag)}/`}
                      className={classes.tagLink}
                    >
                      <Chip
                        label={tag}
                        size="small"
                        className={classes.tagChip}
                        clickable
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: html }}
          itemProp="articleBody"
        />
        <hr />
        <footer>
          <Bio />
        </footer>
      </article>
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        tags
      }
    }
  }
`;
