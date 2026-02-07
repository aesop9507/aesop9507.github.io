import * as React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import Header from "../components/Header"
import CategoryFilter from "../components/CategoryFilter"
import SearchBar from "../components/SearchBar"
import PopularPosts from "../components/PopularPosts"

const IndexPage = ({ data }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')

  // Load dark mode preference
  React.useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(saved === 'true' || (!saved && prefersDark))
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newValue = !isDarkMode
    setIsDarkMode(newValue)
    localStorage.setItem('darkMode', newValue)
    document.documentElement.classList.toggle('dark', newValue)
  }

  // Apply dark mode class on mount
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  // Count posts by category
  const allPosts = data.allMarkdownRemark.edges
  const categoryCounts = {
    all: allPosts.length,
    frontend: allPosts.filter(p => p.node.frontmatter.category === 'Frontend').length,
    backend: allPosts.filter(p => p.node.frontmatter.category === 'Backend').length,
    architecture: allPosts.filter(p => p.node.frontmatter.category === 'Architecture').length,
  }

  // Filter posts by category and search term
  const filteredPosts = allPosts.filter(({ node }) => {
    const matchesCategory = activeCategory === 'all' || node.frontmatter.category === activeCategory
    const matchesSearch = searchTerm === '' ||
      node.frontmatter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.frontmatter.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.frontmatter.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  // Get popular posts (top 4 by some logic - for now just take first 4)
  const popularPosts = allPosts.slice(0, 4)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Aesop's Tech Blog</title>
        <meta name="description" content="Technical articles on frontend, backend, and architecture" />
      </Helmet>

      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold editorial-heading mb-6 text-foreground">
            Technical Writing
          </h2>
          <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            Exploring modern web technologies, architecture patterns, and the art of building digital experiences.
          </p>
          <div className="font-body text-sm text-muted-foreground">
            {allPosts.length} articles published
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

      {/* Category Filter */}
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="decorative-divider"></div>
      </div>

      {/* Popular Posts */}
      {activeCategory === 'all' && searchTerm === '' && (
        <PopularPosts posts={popularPosts} />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(({ node }) => {
              const { title, date, category, tags, author, description } = node.frontmatter
              const { slug } = node.fields
              return (
                <article key={slug} className="hover-lift bg-card border border-border p-6 md:p-8">
                  <div className="mb-3">
                    <span className="font-display text-xs font-medium text-primary uppercase tracking-wider">
                      {category}
                    </span>
                    <span className="font-body text-sm text-muted-foreground ml-4">
                      {date}
                    </span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold editorial-heading mb-3 text-foreground">
                    {title}
                  </h2>
                  <p className="font-body text-sm md:text-base text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags?.slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        className="font-display text-xs text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="font-body text-xs text-muted-foreground">
                      By {author}
                    </span>
                    <span className="font-display text-xs text-primary">
                      Read article →
                    </span>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="font-display text-sm text-muted-foreground mb-4">
            Built with Gatsby & Tailwind CSS
          </div>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aesop's Tech Blog
          </p>
        </div>
      </footer>
    </div>
  )
}

export default IndexPage

export const query = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            category
            tags
            author
            description
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
