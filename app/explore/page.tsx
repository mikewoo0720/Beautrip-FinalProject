'use client'

import { Suspense } from 'react'
import ExplorePage from '@/components/ExplorePage'

export default function Explore() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <ExplorePage />
    </Suspense>
  )
}

