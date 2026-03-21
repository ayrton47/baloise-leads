'use client'

interface LeadsPaginationProps {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export default function LeadsPagination({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: LeadsPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    const halfWindow = Math.floor(maxPagesToShow / 2)

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = currentPage - halfWindow
      let end = currentPage + halfWindow

      if (start < 1) {
        end += 1 - start
        start = 1
      }
      if (end > totalPages) {
        start -= end - totalPages
        end = totalPages
      }

      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('...')
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItems = parseInt(e.target.value)
    onItemsPerPageChange(newItems)
    // Reset to page 1 when changing items per page
    onPageChange(1)
  }

  const pageNumbers = getPageNumbers()
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4 md:px-0">
      {/* Info Text */}
      <div className="text-sm text-gray-600">
        {totalItems === 0 ? (
          <span>No leads</span>
        ) : (
          <span>
            Showing <span className="font-semibold">{startItem}</span>-
            <span className="font-semibold">{endItem}</span> of{' '}
            <span className="font-semibold">{totalItems}</span> leads
          </span>
        )}
      </div>

      {/* Page Controls & Dropdown Container */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Items Per Page Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm text-gray-600 hidden sm:inline">
            Per page:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
            className={`px-3 py-2 rounded border transition ${
              hasPreviousPage
                ? 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                : 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
            }`}
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                )
              }

              const pageNum = page as number
              const isActive = pageNum === currentPage

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 rounded border transition ${
                    isActive
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className={`px-3 py-2 rounded border transition ${
              hasNextPage
                ? 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                : 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
            }`}
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
