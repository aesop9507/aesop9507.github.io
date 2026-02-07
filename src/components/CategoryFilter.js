import React from "react"

const CategoryFilter = ({ activeCategory, onCategoryChange, counts }) => {
  const categories = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'Frontend', label: 'Frontend', count: counts.frontend },
    { id: 'Backend', label: 'Backend', count: counts.backend },
    { id: 'Architecture', label: 'Architecture', count: counts.architecture },
    { id: 'Security', label: 'Security', count: counts.security },
    { id: 'DevOps', label: 'DevOps', count: counts.devops },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`font-display text-sm px-4 py-2 rounded-full transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat.label}
            <span className="ml-2 text-xs opacity-70">({cat.count})</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter
