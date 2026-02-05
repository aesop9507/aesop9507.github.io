import * as React from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"

const IndexPage = ({ data }) => {
  const posts = data.allMarkdownRemark.edges

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Aesop's Tech Blog</title>
        <meta name="description" content="Technical articles on frontend, backend, and architecture" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Aesop's Tech Blog</h1>
          <p className="text-muted-foreground mt-2">Frontend · Backend · Architecture</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(({ node }) => {
            const { title, date, category, tags, author, description } = node.frontmatter
            const { slug } = node.fields
            return (
              <article
                key={slug}
                className="border border-border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-primary text-primary-foreground">
                    {category}
                  </span>
                  <span className="text-xs text-muted-foreground">{date}</span>
                </div>
                <Link to={slug} className="block">
                  <h2 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                    {title}
                  </h2>
                </Link>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">By {author}</p>
              </article>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Aesop's Tech Blog. Built with Gatsby.
        </div>
      </footer>
    </div>
  )
}

export default IndexPage

export const query = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            category
            tags
            author
            description
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
