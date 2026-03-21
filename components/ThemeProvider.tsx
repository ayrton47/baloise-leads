'use client'

import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      const darkMode = saved === 'dark'
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
