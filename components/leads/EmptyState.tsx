'use client'

interface EmptyStateProps {
  type: 'no-leads' | 'no-results'
  onAddLead?: () => void
  onClearFilters?: () => void
}

export default function EmptyState({ type, onAddLead, onClearFilters }: EmptyStateProps) {
  if (type === 'no-leads') {
    return (
      <div className="text-center py-24 px-4">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 transition-colors">Aucun lead pour le moment</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto transition-colors">
          Commencez par ajouter votre premier prospect. Cliquez sur le bouton ci-dessous pour créer un nouveau lead.
        </p>
        <button
          onClick={onAddLead}
          className="bg-[#00358E] hover:bg-[#00266b] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Créer le premier lead
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-24 px-4">
      <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 transition-colors">Aucun résultat</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto transition-colors">
        Aucun lead ne correspond à vos filtres. Essayez de modifier vos critères de recherche.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onClearFilters}
          className="px-6 py-3 rounded-xl font-bold text-[#00358E] bg-blue-50 hover:bg-blue-100 transition-all border-2 border-blue-100"
        >
          Effacer les filtres
        </button>
        <button
          onClick={onAddLead}
          className="px-6 py-3 rounded-xl font-bold text-white bg-[#00358E] hover:bg-[#00266b] transition-all shadow-md hover:shadow-lg"
        >
          Ajouter un lead
        </button>
      </div>
    </div>
  )
}
