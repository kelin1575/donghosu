'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function CategoryPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCertified, setIsCertified] = useState(false)
  const router = useRouter()
  const params = useParams()
  const aptId = params.aptId as string
  const category = decodeURIComponent(params.category as string)
  const supabase = createClient()

  useEffect(() => {
    checkCertification()
    loadPosts()
  }, [])

  const checkCertification = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('certifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('apartment_id', aptId)
      .eq('is_active', true)
      .single()

    setIsCertified(!!data)
  }

  const loadPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('apartment_id', aptId)
      .eq('category', category)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })

    setPosts(data || [])
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const categoryEmoji: Record<string, string> = {
    '자유': '💬',
    '민원': '🚨',
    '나눔': '🎁',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 text-sm"
          >
            ← 홈
          </button>
          <h2 className="font-bold text-gray-800">
            {categoryEmoji[category]} {category}
          </h2>
          <div className="w-8" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-20 text-gray-300">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{categoryEmoji[category]}</div>
            <p className="text-gray-400">아직 게시글이 없습니다</p>
            <p className="text-gray-300 text-sm mt-1">첫 글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/${aptId}/post/${post.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
              >
                {/* 익명 태그 + 시간 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-400 font-medium">
                    {post.anonymous_tag}
                  </span>
                  <span className="text-xs text-gray-300">
                    {formatDate(post.created_at)}
                  </span>
                </div>

                {/* 내용 */}
                <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                  {post.content}
                </p>

                {/* 하단 */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-300">
                    ❤️ {post.like_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 글쓰기 버튼 (인증된 주민만) */}
      {isCertified && (
        <button
          onClick={() => router.push(`/${aptId}/write`)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg text-2xl hover:bg-blue-600 transition flex items-center justify-center"
        >
          ✏️
        </button>
      )}
    </div>
  )
}