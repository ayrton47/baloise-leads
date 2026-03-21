'use client'

interface EmptyStateProps {
  type: 'no-leads' | 'no-results'
  onAddLead?: () => void
  onClearFilters?: () => void
}

export default function EmptyState({ type, onAddLead, onClearFilters }: EmptyStateProps) {
  if (type === 'no-leads') {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-6xl mb-4">📭</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">No leads yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto transition-colors">
          Get started by adding your first lead to your sales pipeline. Click the button below to create a new lead.
        </p>
        <button
          onClick={onAddLead}
          className="bg-blue-900 dark:bg-blue-700 hover:bg-blue-950 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2"
        >
          <span>+</span> Create First Lead
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-20 px-4">
      <p className="text-6xl mb-4">🔍</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">No leads match your filters</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto transition-colors">
        Try adjusting your search query or filter criteria to find the leads you're looking for.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onClearFilters}
          className="px-6 py-3 rounded-lg font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
        >
          Clear Filters
        </button>
        <button
          onClick={onAddLead}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-900 dark:bg-blue-700 hover:bg-blue-950 dark:hover:bg-blue-800 transition"
        >
          Add New Lead
        </button>
      </div>
    </div>
  )
}
