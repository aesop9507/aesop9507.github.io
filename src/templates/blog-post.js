import * as React from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const { previous, next } = pageContext
  const { title, date, category, tags, author, description } = post.frontmatter
  const { slug } = post.fields

  const siteUrl = "https://aesop9507.github.io"
  const imageUrl = `${siteUrl}/og-image.png`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title} - Aesop's Tech Blog</title>
        <meta name="description" content={description} />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={`${siteUrl}${slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Aesop's Tech Blog" />

        {/* Article specific */}
        <meta property="article:author" content={author} />
        <meta property="article:published_time" content={date} />
        <meta property="article:section" content={category} />
        {tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="font-display text-sm md:text-base hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Blog</span>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-12 pb-8 border-b border-border">
            <div className="mb-4">
              <span className="font-display text-xs font-medium text-primary uppercase tracking-wider">
                {category}
              </span>
              <span className="font-body text-sm text-muted-foreground ml-4">
                {date}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold editorial-heading mb-6 text-foreground leading-tight">
              {title}
            </h1>

            <p className="font-body text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{author}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {tags?.map(tag => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
        </div>
      </article>

      {/* Navigation */}
      <nav className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="font-display text-sm text-muted-foreground mb-8">
            More Articles
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {previous && (
              <Link
                to={previous.fields.slug}
                className="hover-lift bg-card border border-border p-6 block"
              >
                <div className="font-display text-xs text-muted-foreground mb-2">
                  Previous
                </div>
                <div className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors">
                  {previous.frontmatter.title}
                </div>
                <div className="font-body text-sm text-muted-foreground mt-2">
                  {previous.frontmatter.category}
                </div>
              </Link>
            )}
            {next && (
              <Link
                to={next.fields.slug}
                className={`hover-lift bg-card border border-border p-6 block ${!previous ? 'md:col-start-2' : ''}`}
              >
                <div className="font-display text-xs text-muted-foreground mb-2">
                  Next
                </div>
                <div className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors">
                  {next.frontmatter.title}
                </div>
                <div className="font-body text-sm text-muted-foreground mt-2">
                  {next.frontmatter.category}
                </div>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <Link
            to="/"
            className="font-display text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Blog</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default BlogPostTemplate

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        slug
      }
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
