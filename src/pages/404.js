import * as React from "react"
import { Link, Head } from "gatsby"

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Head>
        <title>404 - Not Found | Aesop's Tech Blog</title>
        <meta name="description" content="Page not found" />
      </Head>

      <div className="text-center max-w-xl mx-auto">
        <div className="font-display text-6xl md:text-7xl font-semibold editorial-heading mb-6 text-foreground">
          404
        </div>

        <h1 className="font-display text-xl md:text-2xl font-semibold editorial-heading mb-4 text-foreground">
          Page Not Found
        </h1>

        <p className="font-body text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="hover-lift inline-flex items-center gap-2 bg-card border border-border px-6 py-3 font-display text-sm text-primary hover:text-accent transition-colors"
        >
          <span>←</span>
          <span>Back to Blog</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
