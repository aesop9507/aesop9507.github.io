import * as React from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"

const BlogPostTemplate = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const { previous, next } = pageContext
  const { title, date, category, tags, author, description } = post.frontmatter

  return (
    <div className="min-h-screen bg-background text-foreground scanlines">
      <Helmet>
        <title>{title} - Aesop's Tech Blog</title>
        <meta name="description" content={description} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="font-display text-sm md:text-base hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <span className="text-lg">←</span>
            <span className="tracking-wider">BACK_TO_INDEX</span>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-display text-xs font-semibold px-3 py-1.5 rounded bg-primary/10 text-primary border border-primary/20">
              {category}
            </span>
            <span className="font-display text-xs text-muted-foreground">
              {date}
            </span>
            <span className="font-display text-xs text-primary/50">
              // ARTICLE_ID: {post.id.slice(-6)}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 cyber-heading leading-tight">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
            <p className="font-display text-sm text-muted-foreground">
              <span className="text-primary">@</span> {author}
            </p>
            <div className="font-display text-xs text-muted-foreground">
              [ SYSTEM_READY ]
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {tags?.map(tag => (
              <span
                key={tag}
                className="font-display text-xs px-3 py-1.5 rounded bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>

        {/* Navigation */}
        <nav className="mt-16 pt-8 border-t border-border">
          <div className="font-display text-xs text-muted-foreground mb-6 tracking-wider">
            // NAVIGATION
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {previous && (
              <Link
                to={previous.fields.slug}
                className="neon-border bg-card border border-border p-6 hover:transform hover:scale-[1.02] transition-all duration-300 block"
              >
                <div className="font-display text-xs text-muted-foreground mb-2">
                  ← PREVIOUS
                </div>
                <div className="font-display text-lg font-bold hover:text-primary transition-colors">
                  {previous.frontmatter.title}
                </div>
                <div className="font-display text-xs text-muted-foreground mt-2">
                  {previous.frontmatter.category}
                </div>
              </Link>
            )}
            {next && (
              <Link
                to={next.fields.slug}
                className={`neon-border bg-card border border-border p-6 hover:transform hover:scale-[1.02] transition-all duration-300 block ${!previous ? 'md:col-start-2 md:mr-auto' : ''}`}
              >
                <div className="font-display text-xs text-muted-foreground mb-2">
                  NEXT →
                </div>
                <div className="font-display text-lg font-bold hover:text-primary transition-colors">
                  {next.frontmatter.title}
                </div>
                <div className="font-display text-xs text-muted-foreground mt-2">
                  {next.frontmatter.category}
                </div>
              </Link>
            )}
          </div>
        </nav>

        {/* Back to Index */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="font-display text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>RETURN_TO_INDEX</span>
          </Link>
        </div>
      </article>
    </div>
  )
}

export default BlogPostTemplate

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        title
        date(formatString: "YYYY-MM-DD")
        category
        tags
        author
        description
      }
    }
  }
`
