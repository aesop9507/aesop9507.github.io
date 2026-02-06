import * as React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground scanlines flex items-center justify-center px-4">
      <Helmet>
        <title>404 - Not Found | Aesop's Tech Blog</title>
        <meta name="description" content="Page not found" />
      </Helmet>

      <div className="text-center max-w-2xl mx-auto">
        <div className="font-display text-8xl md:text-9xl font-bold cyber-heading mb-4 float">
          404
        </div>
        <div className="font-display text-xs text-primary mb-8 tracking-[0.3em] uppercase">
          // Error: Page not found
        </div>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
          The digital resource you're looking for has been lost in void.
          Redirecting to home base...
        </p>

        <Link
          to="/"
          className="neon-border inline-flex items-center gap-3 bg-card border border-border px-8 py-4 font-display text-sm hover:text-primary transition-colors hover:transform hover:scale-105 transition-all duration-300"
        >
          <span>←</span>
          <span className="tracking-wider">RETURN_TO_INDEX</span>
        </Link>

        <div className="mt-16 font-display text-xs text-muted-foreground">
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-primary">●</span>
            <span className="text-secondary">●</span>
            <span className="text-accent">●</span>
          </div>
          <div>[ SYSTEM_ERROR_404 ]</div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
