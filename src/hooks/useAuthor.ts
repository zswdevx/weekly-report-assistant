import { getAuthors, setAuthors } from '@/services/settings'
import { useEffect, useState } from 'react'

export default function useAuthor() {
  const [authors, setAuthorState] = useState<string[]>([])

  useEffect(() => {
    getAuthors().then(setAuthorState)
  }, [])

  const handleAddAuthor = async (name: string) => {
    const newAuthors = authors.includes(name) ? authors : [...authors, name]
    const res = await setAuthors(newAuthors)
    if (!res) return
    setAuthorState(newAuthors)
  }

  const handleDeleteAuthor = async (name: string) => {
    const newAuthors = authors.filter((n) => n !== name)
    const res = await setAuthors(newAuthors)
    if (!res) return
    setAuthorState(newAuthors)
  }

  return { authors, handleAddAuthor, handleDeleteAuthor }
}
