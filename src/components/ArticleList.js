import React from "react"
import { Link } from "gatsby"

const ArticleList = ({ posts }) => {
  const getCategoryClass = (cat) => {
    if (cat === 'Frontend') return 'text-primary'
    if (cat === 'Backend') return 'text-secondary'
    if (cat === 'Architecture') return 'text-purple-600 dark:text-purple-400'
    if (cat === 'Security') return 'text-red-600 dark:text-red-400'
    if (cat === 'DevOps') return 'text-cyan-600 dark:text-cyan-400'
    return 'text-muted-foreground'
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-display text-xl font-semibold text-foreground mb-8">
          전체 아티클
        </h3>

        <div className="space-y-0 divide-y divide-border">
          {posts.map(({ node }) => {
            const { title, date, category, tags, author, description } = node.frontmatter
            const { slug } = node.fields
            return (
              <article key={slug} className="group py-6 hover-subtle rounded-lg -mx-4 px-4">
                <Link to={slug} className="block">
                  {/* Category & Date & Author */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-display text-xs font-medium ${getCategoryClass(category)}`}>
                      {category}
                    </span>
                    <span className="font-display text-xs text-muted-foreground">
                      {author}
                    </span>
                    <span className="font-display text-xs text-muted-foreground/70">
                      {date}
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
