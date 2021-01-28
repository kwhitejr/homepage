const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');
const kebabCase = require('lodash.kebabcase');

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Define a template for blog post
  const postTemplate = path.resolve('./src/templates/article.jsx');
  const tagTemplate = path.resolve('./src/templates/tag.jsx');

  // Get all markdown blog posts sorted by date
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
              tags
              status
            }
          }
        }
      }
    `,
  );

  if (result.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts',
      result.errors,
    );
    return;
  }

  const posts = result.data.allMarkdownRemark.nodes;

  const uniqueTags = new Set();

  // Create posts pages
  posts.forEach((post) => {
    // Add tags to set. C'mon bro support optional chaining already
    post.frontmatter && post.frontmatter.tags && post.frontmatter.tags.forEach((tag) => uniqueTags.add(tag));

    createPage({
      path: post.fields.slug,
      component: postTemplate,
      context: {
        slug: post.fields.slug,
      },
    });
  });

  // Create tags pages
  const tags = Array.from(uniqueTags);
  tags.forEach((tag) => {
    createPage({
      path: `/tags/${kebabCase(tag)}/`,
      component: tagTemplate,
      context: {
        tag,
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    const value = createFilePath({ node, getNode });

    createNodeField({
      name: 'slug',
      node,
      value,
    });
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  const typeDefs = `
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
    }

    type Author {
      name: Name
      summary: String
    }

    type Name {
      first: String
      last: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String!
      description: String
      date: Date @dateformat
      tags: [String!]
      status: String!
    }

    type Fields {
      slug: String
    }
  `;

  createTypes(typeDefs);
};
