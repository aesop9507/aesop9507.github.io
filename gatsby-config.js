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
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) =>
              allMarkdownRemark.edges.map(({ node }) => ({
                title: node.frontmatter.title,
                description: node.frontmatter.description || node.excerpt,
                date: node.frontmatter.date,
                url: `${site.siteMetadata.siteUrl}${node.fields.slug}`,
                guid: `${site.siteMetadata.siteUrl}${node.fields.slug}`,
                categories: node.frontmatter.tags || [],
              })),
            query: `
              {
                allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
                  edges {
                    node {
                      excerpt(pruneLength: 280)
                      fields {
                        slug
                      }
                      frontmatter {
                        title
                        description
                        date
                        tags
                      }
                    }
                  }
                }
              }
            `,
            output: `/rss.xml`,
            title: `Aesop's Tech Blog RSS Feed`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/sitemap.xml`,
      },
    },
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        host: `https://aesop9507.github.io`,
        sitemap: `https://aesop9507.github.io/sitemap.xml`,
        policy: [{ userAgent: `*`, allow: `/` }],
      },
    },
    `gatsby-plugin-react-helmet`,
  ],
}
