import * as React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import Header from "../components/Header"
import SearchBar from "../components/SearchBar"
import PopularPosts from "../components/PopularPosts"
import FeaturedPost from "../components/FeaturedPost"
import ArticleList from "../components/ArticleList"
import ArticleSeries from "../components/ArticleSeries"

const IndexPage = ({ data }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [featuredIndex, setFeaturedIndex] = React.useState(0)
  const [showSearchInput, setShowSearchInput] = React.useState(false)

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

  // Apply dark mode class on mount
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  // Get all posts
  const allPosts = data.allMarkdownRemark.edges

  // Filter posts by search term
  const filteredPosts = allPosts.filter(({ node }) => {
    const matchesSearch = searchTerm === '' ||
      node.frontmatter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.frontmatter.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.frontmatter.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  // Featured post navigation
  const featuredPost = allPosts[0]?.node
  const onPrev = () => setFeaturedIndex(Math.max(0, featuredIndex - 1))
  const onNext = () => setFeaturedIndex(Math.min(allPosts.length - 1, featuredIndex + 1))

  // Don't show featured post in regular list when no search
  const listPosts = searchTerm === ''
    ? allPosts.slice(1)
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

      {/* Featured Post - only show when no search */}
      {!showSearchInput && searchTerm === '' && featuredPost && (
        <FeaturedPost
          post={featuredPost}
          onPrev={onPrev}
          onNext={onNext}
          hasPrev={featuredIndex > 0}
          hasNext={featuredIndex < allPosts.length - 1}
        />
      )}

      {/* Main Content - Article List */}
      <ArticleList posts={listPosts} />

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
