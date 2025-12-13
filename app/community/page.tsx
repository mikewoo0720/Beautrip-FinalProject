'use client'

import { Suspense } from 'react'
import CommunityPage from '@/components/CommunityPage'

export default function Community() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <CommunityPage />
    </Suspense>
  )
}

