import React from "react"
import { Link } from "gatsby"

const FeaturedPost = ({ post }) => {
  if (!post) return null

  const { title, date, category, tags, author, description } = post.frontmatter
  const { slug } = post.fields

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 dark:from-primary/20 dark:via-background dark:to-accent/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <Link to={slug} className="block group">
            {/* Category & Date */}
            <div className="flex items-center gap-4 mb-6">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {category}
              </span>
              <span className="text-sm text-muted-foreground">{date}</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors leading-tight">
              {title}
            </h1>

            {/* Description */}
            <p className="font-body text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl">
              {description}
            </p>

            {/* Author & Read More */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {author?.charAt(0) || 'O'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{author}</div>
                  <div className="text-xs text-muted-foreground">Author</div>
                </div>
              </div>

              <div className="font-display text-sm font-medium text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                Read Article
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-border/50">
              {tags?.slice(0, 5).map(tag => (
                <span key={tag} className="text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedPost
