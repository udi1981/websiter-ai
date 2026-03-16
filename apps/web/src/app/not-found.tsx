import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text mb-2">Page not found</h2>
        <p className="text-text-muted mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
