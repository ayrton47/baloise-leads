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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No leads yet</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Get started by adding your first lead to your sales pipeline. Click the button below to create a new lead.
        </p>
        <button
          onClick={onAddLead}
          className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-950 transition inline-flex items-center gap-2"
        >
          <span>+</span> Create First Lead
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-20 px-4">
      <p className="text-6xl mb-4">🔍</p>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No leads match your filters</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Try adjusting your search query or filter criteria to find the leads you're looking for.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onClearFilters}
          className="px-6 py-3 rounded-lg font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 transition"
        >
          Clear Filters
        </button>
        <button
          onClick={onAddLead}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-950 transition"
        >
          Add New Lead
        </button>
      </div>
    </div>
  )
}
