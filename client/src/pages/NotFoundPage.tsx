import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-zinc-900 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-bold text-stone-300 dark:text-zinc-700">404</p>
        <h1 className="text-xl font-semibold text-stone-800 dark:text-zinc-100 mt-4">Page not found</h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 bg-blue-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-blue-700 transition"
        >
          Back to IP Atlas
        </Link>
      </div>
    </div>
  )
}
