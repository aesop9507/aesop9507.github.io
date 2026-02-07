import React from "react"
import { Link } from "gatsby"

const ArticleSeries = () => {
  // For now, this is a placeholder - series data should come from frontmatter
  const series = [
    {
      title: "React Router v7 Deep Dive",
      description: "React Router v7의 새로운 기능과 변경사항을 다루는 시리즈",
      count: 3,
      slug: "/blog/react-router-v7-series"
    },
    {
      title: "React Query 마스터하기",
      description: "서버 상태 관리의 표준 React Query를 완벽히 이해하는 시리즈",
      count: 5,
      slug: "/blog/react-query-series"
    }
  ]

  if (series.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-display text-xl font-semibold text-foreground mb-8">
          아티클 시리즈
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {series.map((s, index) => (
            <Link
              key={index}
              to={s.slug}
              className="group hover-lift bg-card border border-border p-6"
            >
              <div className="text-xs text-muted-foreground mb-2">
                아티클 {s.count}개
              </div>
              <h4 className="font-display text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {s.title}
              </h4>
              <p className="font-body text-sm text-muted-foreground line-clamp-2">
                {s.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ArticleSeries
