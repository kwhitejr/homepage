/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Image from 'gatsby-image';

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50, quality: 95) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name {
              first
              last
            }
            summary
          }
        }
      }
    }
  `);

  const author = data.site.siteMetadata?.author;

  const avatar = data?.avatar?.childImageSharp?.fixed;

  return (
    <div css={{
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'row',
      alignContent: 'flex-start',
    }}
    >
      {avatar && (
        <Image
          fixed={avatar}
          alt={author?.name?.first || ''}
          className="bio-avatar"
          imgStyle={{
            borderRadius: '50%',
          }}
        />
      )}
      {author?.name?.first && (
        <p css={{
          marginLeft: '10px',
          verticalAlign: 'middle',
        }}
        >
          <strong>{author.name.first}</strong>
          {' '}
          {author?.summary || null}
          {' '}
        </p>
      )}
    </div>
  );
};

export default Bio;
