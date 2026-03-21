'use client'

import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check localStorage first
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      const darkMode = saved === 'dark'
      setIsDark(darkMode)
      applyTheme(darkMode)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      applyTheme(prefersDark)
    }
  }, [])

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  const toggle = () => {
    setIsDark(prev => {
      const newDark = !prev
      applyTheme(newDark)
      localStorage.setItem('theme', newDark ? 'dark' : 'light')
      return newDark
    })
  }

  return { isDark, isMounted, toggle }
}
