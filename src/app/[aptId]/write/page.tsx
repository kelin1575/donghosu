'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import type { Category } from '@/types'

// 익명 태그 생성
const adjectives = [
  '조용한', '따뜻한', '바쁜', '수줍은',
  '느긋한', '새벽의', '포근한', '부지런한',
  '산뜻한', '나른한', '설레는', '든든한'
]
const nouns = [
  '고양이', '슬리퍼', '베란다', '이불',
  '화분', '우산', '라디오', '텃밭',
  '커피잔', '자전거', '창문', '우체통'
]

function generateTag(userId: string, seed: string): string {
  let hash = 0
  const str = userId + seed
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const absHash = Math.abs(hash)
  const adj = adjectives[absHash % adjectives.length]
  const noun = nouns[Math.floor(absHash / adjectives.length) % nouns.length]
  return `${adj} ${noun}`
}

export default function WritePage() {
  const [category, setCategory] = useState<Category>('자유')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCertified, setIsCertified] = useState(false)
  const router = useRouter()
  const params = useParams()
  const aptId = params.aptId as string
  const supabase = createClient()

  useEffect(() => {
    checkCertification()
  }, [])

  const checkCertification = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data } = await supabase
      .from('certifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('apartment_id', aptId)
      .eq('is_active', true)
      .single()

    setIsCertified(!!data)
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // 인증 확인
    const { data: cert } = await supabase
      .from('certifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('apartment_id', aptId)
      .eq('is_active', true)
      .single()

    if (!cert) {
      setError('이 단지의 인증된 주민만 글을 쓸 수 있습니다')
      setLoading(false)
      return
    }

    const anonymousTag = generateTag(user.id, Date.now().toString())

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        apartment_id: aptId,
        category,
        content: content.trim(),
        anonymous_tag: anonymousTag,
      })
      .select()
      .single()

    if (postError) {
      setError('글 작성 중 오류가 발생했습니다')
      setLoading(false)
      return
    }

    router.push(`/${aptId}/${category}`)
  }

  if (!isCertified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">인증된 주민만 글을 쓸 수 있습니다</h2>
          <p className="text-gray-400 text-sm mb-8">단지 인증 후 이용해주세요</p>
          <button
            onClick={() => router.push('/certify')}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition"
          >
            단지 인증하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-gray-400 text-sm"
          >
            ← 취소
          </button>
          <h2 className="font-bold text-gray-800">글쓰기</h2>
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="text-blue-500 font-medium text-sm disabled:opacity-40"
          >
            {loading ? '등록 중...' : '등록'}
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 카테고리 선택 */}
        <div className="flex gap-2 mb-6">
          {(['자유', '민원', '나눔'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                category === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 내용 입력 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이웃들과 나누고 싶은 이야기를 작성해주세요"
            rows={10}
            maxLength={1000}
            className="w-full resize-none focus:outline-none text-gray-800 placeholder-gray-300"
          />
          <div className="text-right text-xs text-gray-300 mt-2">
            {content.length}/1000
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* 익명 안내 */}
        <p className="text-center text-xs text-gray-300 mt-6">
          🔒 모든 글은 익명으로 게시됩니다
        </p>
      </div>
    </div>
  )
}