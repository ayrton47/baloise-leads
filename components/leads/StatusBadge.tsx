'use client'

import { LeadStatus } from '@/lib/types'

const statusConfig: Record<LeadStatus, { bg: string; text: string; border: string; label: string; darkBg?: string; darkText?: string; darkBorder?: string }> = {
  NEW: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    darkBg: 'dark:bg-blue-900/20',
    darkText: 'dark:text-blue-300',
    darkBorder: 'dark:border-blue-700',
    label: 'New',
  },
  IN_PROGRESS: {
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-200',
    darkBg: 'dark:bg-orange-900/20',
    darkText: 'dark:text-orange-300',
    darkBorder: 'dark:border-orange-700',
    label: 'In Progress',
  },
  TO_CONTACT: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    border: 'border-yellow-200',
    darkBg: 'dark:bg-yellow-900/20',
    darkText: 'dark:text-yellow-300',
    darkBorder: 'dark:border-yellow-700',
    label: 'To Contact',
  },
  QUOTED: {
    bg: 'bg-green-50',
    text: 'text-green-900',
    border: 'border-green-200',
    darkBg: 'dark:bg-green-900/20',
    darkText: 'dark:text-green-300',
    darkBorder: 'dark:border-green-700',
    label: 'Quoted',
  },
  REFUSED: {
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-200',
    darkBg: 'dark:bg-red-900/20',
    darkText: 'dark:text-red-300',
    darkBorder: 'dark:border-red-700',
    label: 'Refused',
  },
  CONVERTED: {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    darkBg: 'dark:bg-purple-900/20',
    darkText: 'dark:text-purple-300',
    darkBorder: 'dark:border-purple-700',
    label: 'Converted',
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
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-semibold border transition-colors ${config.bg} ${config.text} ${config.border} ${config.darkBg} ${config.darkText} ${config.darkBorder}`}
    >
      {config.label}
    </span>
  )
}
