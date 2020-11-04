module.exports = {
  siteMetadata: {
    title: 'kwhitejr',
    author: {
      name: {
        first: 'Kevin',
        last: 'White',
      },
      summary: 'lives in Oregon brewing his coffee, walking his puppy, and slowly learning to program better.',
    },
    description: 'A programming blog and other things.',
    siteUrl: 'https://kwhitejr.com',
  },
  plugins: [
    {
      // Keep this plugin first: https://www.gatsbyjs.com/plugins/gatsby-plugin-material-ui/
      resolve: 'gatsby-plugin-material-ui',
      options: {
        stylesProvider: {
          injectFirst: true,
        },
      },
    },
    'gatsby-plugin-emotion',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-feed',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'src/utils/typography',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/blog`,
        name: 'blog',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/assets`,
        name: 'assets',
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: {
              wrapperStyle: 'margin-bottom: 1.0725rem',
            },
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants',
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        // trackingId: `ADD YOUR TRACKING ID HERE`,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'kwhitejr',
        short_name: 'kwhitejr',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'content/assets/profile-pic.jpg',
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    // {
    //   resolve: 'gatsby-plugin-s3',
    //   options: {
    //     bucketName: 'kwhitejr.com',
    //   },
    // },
  ],
};
