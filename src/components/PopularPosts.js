import React from "react"
import { Link } from "gatsby"

const PopularPosts = ({ posts }) => {
  if (!posts || posts.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-display text-xl font-semibold editorial-heading mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Popular Articles
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {posts.map((post, index) => (
            <Link
              key={post.node.id}
              to={post.node.fields.slug}
              className="hover-lift bg-card border border-border p-4 flex items-start gap-3"
            >
              <span className="font-display text-lg font-bold text-muted-foreground/30">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {post.node.frontmatter.title}
                </h4>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {post.node.frontmatter.author}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularPosts
