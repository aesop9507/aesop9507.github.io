/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Aesop's Tech Blog`,
    description: `Technical articles on frontend, backend, and architecture`,
    author: `@aesop9507`,
    siteUrl: `https://aesop9507.github.io`,
  },
  plugins: [
    `gatsby-plugin-postcss`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/content/posts`,
      },
    },
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-remark-shiki`,
      options: {
        theme: 'github-dark',
        wrapInlineCodeIn: '`',
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Aesop's Tech Blog`,
        short_name: `Tech Blog`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
  ],
}
