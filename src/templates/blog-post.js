import * as React from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"

const BlogPostTemplate = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const { previous, next } = pageContext
  const { title, date, category, tags, author, description } = post.frontmatter

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title} - Aesop's Tech Blog</title>
        <meta name="description" content={description} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-lg font-bold hover:text-primary transition-colors">
            ← Back to Blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold px-2 py-1 rounded bg-primary text-primary-foreground">
              {category}
            </span>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {author}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {tags?.map(tag => (
              <span
                key={tag}
                className="text-sm px-2 py-1 rounded bg-secondary text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* Navigation */}
        <nav className="mt-12 pt-8 border-t border-border flex justify-between">
          {previous && (
            <Link
              to={previous.fields.slug}
              className="text-primary hover:underline"
            >
              ← {previous.frontmatter.title}
            </Link>
          )}
          {next && (
            <Link
              to={next.fields.slug}
              className="text-primary hover:underline ml-auto"
            >
              {next.frontmatter.title} →
            </Link>
          )}
        </nav>
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
