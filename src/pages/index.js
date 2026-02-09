import * as React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import Header from "../components/Header"
import CategoryFilter from "../components/CategoryFilter"
import SearchBar from "../components/SearchBar"
import PopularPosts from "../components/PopularPosts"
import FeaturedPost from "../components/FeaturedPost"
import ArticleList from "../components/ArticleList"
import ArticleSeries from "../components/ArticleSeries"

const IndexPage = ({ data }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [featuredIndex, setFeaturedIndex] = React.useState(0)
  const [showSearchInput, setShowSearchInput] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState('all')

  // Reset featured index when category changes
  const handleCategoryChange = (newCategory) => {
    setActiveCategory(newCategory)
    setFeaturedIndex(0)
  }

  // Default to dark mode
  React.useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldDark = saved === null ? prefersDark : saved === 'true'
    setIsDarkMode(shouldDark)
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newValue = !isDarkMode
    setIsDarkMode(newValue)
    localStorage.setItem('darkMode', newValue)
    document.documentElement.classList.toggle('dark', newValue)
  }

  // Apply dark mode class on mount (only on client side)
  React.useEffect(() => {
    if (isDarkMode !== null) {
      document.documentElement.classList.toggle('dark', isDarkMode)
    }
  }, [isDarkMode])

  // Get all posts
  const allPosts = data.allMarkdownRemark.edges

  // Count posts by category
  const categoryCounts = {
    all: allPosts.length,
    frontend: allPosts.filter(({ node }) => node.frontmatter.category === 'Frontend').length,
    backend: allPosts.filter(({ node }) => node.frontmatter.category === 'Backend').length,
    architecture: allPosts.filter(({ node }) => node.frontmatter.category === 'Architecture').length,
    security: allPosts.filter(({ node }) => node.frontmatter.category === 'Security').length,
    devops: allPosts.filter(({ node }) => node.frontmatter.category === 'DevOps').length,
    pmo: allPosts.filter(({ node }) => node.frontmatter.category === 'PMO').length,
  }

  // Filter posts by category
  const categoryFilteredPosts = activeCategory === 'all'
    ? allPosts
    : allPosts.filter(({ node }) => {
        const cat = node.frontmatter.category
        return cat === activeCategory
      })

  // Filter posts by search term
  const filteredPosts = categoryFilteredPosts.filter(({ node }) => {
    const title = node.frontmatter.title || ''
    const description = node.frontmatter.description || ''
    const tags = node.frontmatter.tags || []
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch = searchTerm === '' ||
      title.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      tags.some(tag => tag.toLowerCase().includes(searchLower))

    return matchesSearch
  })

  // Featured post - use categoryFilteredPosts
  const featuredPost = categoryFilteredPosts[featuredIndex]?.node

  // Featured post navigation - use categoryFilteredPosts length
  const onPrev = () => setFeaturedIndex(Math.max(0, featuredIndex - 1))
  const onNext = () => setFeaturedIndex(Math.min(categoryFilteredPosts.length - 1, featuredIndex + 1))
  const hasPrev = featuredIndex > 0
  const hasNext = featuredIndex < categoryFilteredPosts.length - 1

  // Show all posts in article list (including featured post)
  const listPosts = searchTerm === ''
    ? categoryFilteredPosts
    : filteredPosts

  // Get popular posts (top 4, exclude featured)
  const popularPosts = searchTerm === '' ? allPosts.slice(1, 5) : []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Aesop's Tech Blog</title>
        <meta name="description" content="Technical articles on frontend, backend, and architecture" />
      </Helmet>

      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        showSearchInput={showSearchInput}
        setShowSearchInput={setShowSearchInput}
      />

      {/* Search Bar - show when search is active */}
      {showSearchInput && (
        <div className="container mx-auto px-4 py-4">
          <SearchBar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onClose={() => setShowSearchInput(false)}
          />
        </div>
      )}

      {/* Category Filter - only show when no search */}
      {!showSearchInput && searchTerm === '' && (
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          counts={categoryCounts}
        />
      )}

      {/* Featured Post - only show when no search */}
      {!showSearchInput && searchTerm === '' && featuredPost && (
        <FeaturedPost
          post={featuredPost}
          onPrev={onPrev}
          onNext={onNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}

      {/* Main Content - Article List */}
      <ArticleList posts={listPosts} isSearchResult={searchTerm !== ''} />

      {/* Popular Posts - only show when no search */}
      {!showSearchInput && searchTerm === '' && popularPosts.length > 0 && (
        <PopularPosts posts={popularPosts} />
      )}

      {/* Article Series - only show when no search */}
      {!showSearchInput && searchTerm === '' && <ArticleSeries />}

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="font-display text-sm text-muted-foreground">
                Built with Gatsby & Tailwind CSS
              </div>
              <p className="font-body text-xs text-muted-foreground">
                © {new Date().getFullYear()} Aesop's Tech Blog
              </p>
            </div>
          </div>
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
