'use client'

import { LeadStatus } from '@/lib/types'

const statusConfig: Record<LeadStatus, { bg: string; text: string; border: string; label: string }> = {
  NEW: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    label: 'Nouveau',
  },
  IN_PROGRESS: {
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-200',
    label: 'En cours',
  },
  TO_CONTACT: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    border: 'border-yellow-200',
    label: 'À contacter',
  },
  QUOTED: {
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-200',
    label: 'En cours',
  },
  REFUSED: {
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-200',
    label: 'Refusé',
  },
  CONVERTED: {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    label: 'Converti',
  },
}

interface StatusBadgeProps {
  status: LeadStatus
  size?: 'sm' | 'md' | 'lg'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-semibold border transition-colors ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  )
}
