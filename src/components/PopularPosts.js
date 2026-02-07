import React from "react"
import { Link } from "gatsby"

const PopularPosts = ({ posts }) => {
  if (!posts || posts.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          인기 있는 글
        </h3>

        <div className="space-y-2 divide-y divide-border">
          {posts.map((post, index) => (
            <Link
              key={post.node.id}
              to={post.node.fields.slug}
              className="flex items-center gap-3 py-3 hover:bg-muted/50 rounded-lg px-3 transition-colors group"
            >
              {/* Ranking number */}
              <span className="font-display text-lg font-bold text-muted-foreground/30 w-6">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Title & Author */}
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {post.node.frontmatter.title}
                </h4>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {post.node.frontmatter.author}
                </p>
              </div>

              {/* Chevron */}
              <svg className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularPosts
