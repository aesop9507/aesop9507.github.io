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
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-block">
            <h1 className="font-display text-3xl md:text-4xl font-semibold editorial-heading text-foreground">
              Aesop's Blog
            </h1>
          </Link>
          <p className="font-body text-base text-muted-foreground mt-2">
            Frontend · Backend · Architecture
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold editorial-heading mb-6 text-foreground">
            Technical Writing
          </h2>
          <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            Exploring modern web technologies, architecture patterns, and the art of building digital experiences.
          </p>
          <div className="font-body text-sm text-muted-foreground">
            {posts.length} articles published
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="decorative-divider"></div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {posts.map(({ node }) => {
            const { title, date, category, tags, author, description } = node.frontmatter
            const { slug } = node.fields
            return (
              <article key={slug} className="hover-lift bg-card border border-border p-8">
                <div className="mb-4">
                  <span className="font-display text-xs font-medium text-primary uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="font-body text-sm text-muted-foreground ml-4">
                    {date}
                  </span>
                </div>
                <Link to={slug} className="block group">
                  <h2 className="font-display text-2xl md:text-3xl font-semibold editorial-heading mb-4 text-foreground group-hover:text-primary transition-colors">
                    {title}
                  </h2>
                </Link>
                <p className="font-body text-base md:text-lg text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                  {description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags?.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="font-display text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <span className="font-body text-sm text-muted-foreground">
                    {author}
                  </span>
                  <Link
                    to={slug}
                    className="font-display text-sm text-primary hover:text-accent transition-colors"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="font-display text-sm text-muted-foreground mb-4">
            Built with Gatsby
          </div>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aesop's Tech Blog
          </p>
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
