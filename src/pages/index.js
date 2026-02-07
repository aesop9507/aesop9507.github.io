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
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')

  // Default to dark mode like toss.tech
  React.useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    // Default to dark mode if not set
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
    security: allPosts.filter(p => p.node.frontmatter.category === 'Security').length,
    devops: allPosts.filter(p => p.node.frontmatter.category === 'DevOps').length,
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

  // Get featured post (latest)
  const featuredPost = allPosts[0]?.node

  // Get popular posts (top 4)
  const popularPosts = allPosts.slice(1, 5)

  // Don't show featured post in regular list if showing all
  const listPosts = activeCategory === 'all' && searchTerm === ''
    ? allPosts.slice(1)
    : filteredPosts

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Aesop's Tech Blog</title>
        <meta name="description" content="Technical articles on frontend, backend, and architecture" />
      </Helmet>

      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Search Bar */}
      <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

      {/* Category Filter */}
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Featured Post - only show when all posts and no search */}
      {activeCategory === 'all' && searchTerm === '' && featuredPost && (
        <FeaturedPost post={featuredPost} />
      )}

      {/* Main Content - Article List */}
      <ArticleList posts={listPosts} />

      {/* Popular Posts - only show when all and no search */}
      {activeCategory === 'all' && searchTerm === '' && (
        <PopularPosts posts={popularPosts} />
      )}

      {/* Article Series - only show when all and no search */}
      {activeCategory === 'all' && searchTerm === '' && (
        <ArticleSeries />
      )}

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
