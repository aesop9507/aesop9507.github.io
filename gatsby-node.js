const path = require(`path`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const slug = path.basename(node.fileAbsolutePath, `.md`)

    createNodeField({
      node,
      name: `slug`,
      value: `/blog/${slug}`,
    })

    // Normalize category field - use first category if categories array exists
    let categoryValue = null
    if (node.frontmatter.categories && Array.isArray(node.frontmatter.categories)) {
      categoryValue = node.frontmatter.categories[0]
    } else if (node.frontmatter.category) {
      categoryValue = node.frontmatter.category
    }

    if (categoryValue) {
      // Store in fields for blog-post.js
      createNodeField({
        node,
        name: `category`,
        value: categoryValue
      })

      // Also set in frontmatter for backward compatibility with index.js
      node.frontmatter.category = categoryValue
    }
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMarkdownRemark(sort: { frontmatter: { date: ASC } }) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `)

  const posts = result.data.allMarkdownRemark.edges

  // Create blog post pages
  posts.forEach((post, index) => {
    const previous = index === 0 ? null : posts[index - 1].node
    const next = index === posts.length - 1 ? null : posts[index + 1].node

    createPage({
      path: post.node.fields.slug,
      component: path.resolve(`./src/templates/blog-post.js`),
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}
