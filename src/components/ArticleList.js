import React from "react"
import { Link } from "gatsby"

const ArticleList = ({ posts }) => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-display text-xl font-semibold text-foreground mb-8">
          전체 아티클
        </h3>

        <div className="space-y-8">
          {posts.map(({ node }) => {
            const { title, date, category, tags, author, description } = node.frontmatter
            const { slug } = node.fields
            return (
              <article key={slug} className="group">
                <Link to={slug} className="block">
                  {/* Category & Date */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-display text-xs font-medium text-primary">
                      {category}
                    </span>
                    <span className="font-display text-xs text-muted-foreground">
                      {author}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {title}
                  </h2>

                  {/* Description */}
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ArticleList
