import React from "react"
import { Link } from "gatsby"

const FeaturedPost = ({ post, onPrev, onNext, hasPrev, hasNext }) => {
  if (!post) return null

  const { title, date, category, tags, author, description } = post.frontmatter
  const { slug } = post.fields

  const getCategoryClass = (cat) => {
    const baseClass = "inline-block px-3 py-1 text-xs font-medium rounded-full"
    if (cat === 'Frontend') return `${baseClass} category-badge-Frontend`
    if (cat === 'Backend') return `${baseClass} category-badge-Backend`
    if (cat === 'Architecture') return `${baseClass} category-badge-Architecture`
    if (cat === 'Security') return `${baseClass} category-badge-Security`
    if (cat === 'DevOps') return `${baseClass} category-badge-DevOps`
    if (cat === 'PMO') return `${baseClass} category-badge-PMO`
    return `${baseClass} bg-muted text-muted-foreground`
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <Link to={slug} className="block group">
            {/* Category & Date */}
            <div className="flex items-center gap-3 mb-6">
              <span className={getCategoryClass(category)}>
                {category}
              </span>
              <span className="text-sm text-muted-foreground font-body">{date}</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
              {title}
            </h1>

            {/* Description */}
            <p className="font-body text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl">
              {description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {tags?.slice(0, 6).map(tag => (
                <span key={tag} className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </Link>

          {/* Navigation buttons - like Toss */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={`p-2 rounded-lg transition-colors ${
                hasPrev
                  ? 'bg-card border border-border hover:bg-muted hover:border-primary'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="이전 아티클"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-2 rounded-lg transition-colors ${
                hasNext
                  ? 'bg-card border border-border hover:bg-muted hover:border-primary'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="다음 아티클"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedPost
