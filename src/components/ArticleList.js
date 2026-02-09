import React from "react"
import { Link } from "gatsby"

const ArticleList = ({ posts, isSearchResult = false }) => {
  const getCategoryClass = (cat) => {
    if (cat === 'Frontend') return 'text-primary'
    if (cat === 'Backend') return 'text-secondary'
    if (cat === 'Architecture') return 'text-purple-600 dark:text-purple-400'
    if (cat === 'Security') return 'text-red-600 dark:text-red-400'
    if (cat === 'DevOps') return 'text-cyan-600 dark:text-cyan-400'
    if (cat === 'PMO') return 'text-amber-600 dark:text-amber-400'
    return 'text-muted-foreground'
  }

  if (!posts || posts.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-lg text-muted-foreground">
            {isSearchResult ? '검색 결과가 없습니다.' : '표시할 글이 없습니다.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-display text-xl font-semibold text-foreground mb-8">
          {posts.length}개의 아티클
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

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags?.slice(0, 4).map(tag => (
                      <span key={tag} className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
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
