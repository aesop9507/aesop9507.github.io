import * as React from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"

const IndexPage = ({ data }) => {
  const posts = data.allMarkdownRemark.edges

  return (
    <div className="min-h-screen bg-background text-foreground scanlines">
      <Helmet>
        <title>Aesop's Tech Blog</title>
        <meta name="description" content="Technical articles on frontend, backend, and architecture" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold cyber-heading glitch-hover">
            &lt;AESOP_BLOG /&gt;
          </h1>
          <p className="font-display text-sm md:text-base text-muted-foreground mt-2 tracking-wider">
            FRONTEND · BACKEND · ARCHITECTURE
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="font-display text-xs md:text-sm text-primary mb-4 tracking-[0.3em] uppercase">
            // Welcome to the digital frontier
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="block">Exploring the</span>
            <span className="block cyber-heading">Future of Code</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Deep dives into modern web technologies, architecture patterns, and
            the art of building digital experiences that matter.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="font-display text-xs text-secondary">[ {posts.length} ARTICLES ]</div>
            <div className="font-display text-xs text-primary">[ ONLINE ]</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map(({ node }, index) => {
            const { title, date, category, tags, author, description } = node.frontmatter
            const { slug } = node.fields
            return (
              <article
                key={slug}
                className="neon-border bg-card border border-border p-6 hover:transform hover:scale-[1.02] transition-all duration-300 fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-xs font-semibold px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                    {category}
                  </span>
                  <span className="font-display text-xs text-muted-foreground">
                    {date}
                  </span>
                </div>
                <Link to={slug} className="block group">
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {title}
                  </h2>
                </Link>
                <p className="text-sm md:text-base text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                  {description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags?.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="font-display text-xs px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20"
                    >
                      #{tag}
                    </span>
                  ))}
                  {tags?.length > 3 && (
                    <span className="font-display text-xs px-2 py-1 rounded text-muted-foreground">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="font-display text-xs text-muted-foreground">
                    <span className="text-primary">@</span> {author}
                  </p>
                  <Link
                    to={slug}
                    className="font-display text-sm text-primary hover:text-secondary transition-colors flex items-center gap-1"
                  >
                    READ_ARTICLE →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="font-display text-sm text-muted-foreground mb-4">
            // Built with Gatsby · Powered by OpenClaw
          </div>
          <p className="font-display text-xs text-muted-foreground">
            © {new Date().getFullYear()} AESOP_BLOG. All systems operational.
          </p>
          <div className="mt-4 flex justify-center gap-4 font-display text-xs">
            <span className="text-primary">●</span>
            <span className="text-secondary">●</span>
            <span className="text-accent">●</span>
          </div>
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
