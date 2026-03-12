'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Apartment, Certification } from '@/types'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [certs, setCerts] = useState<any[]>([])
  const [selectedApt, setSelectedApt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setUser(user)

    const { data } = await supabase
      .from('certifications')
      .select('*, apartments(id, name, address)')
      .eq('user_id', user.id)
      .eq('is_active', true)

    setCerts(data || [])
    if (data && data.length > 0) {
      setSelectedApt(data[0].apartments)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  // 비로그인
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-blue-500 mb-2">동호수</h1>
          <p className="text-gray-400 mb-8">우리 단지 이야기</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition mb-3"
          >
            로그인
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            회원가입
          </button>
        </div>
      </div>
    )
  }

  // 인증 안된 경우
  if (certs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-xl font-bold mb-2">단지 인증이 필요합니다</h2>
          <p className="text-gray-400 text-sm mb-8">
            내 아파트 단지를 인증하고<br />이웃들과 소통해보세요
          </p>
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

  // 메인 피드
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-500">동호수</h1>
          <div className="flex items-center gap-3">
            {/* 단지 선택 (2개 인증 시) */}
            {certs.length > 1 && (
              <select
                onChange={(e) => {
                  const apt = certs.find(c => c.apartments.id === e.target.value)?.apartments
                  setSelectedApt(apt)
                }}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1"
              >
                {certs.map((cert) => (
                  <option key={cert.id} value={cert.apartments.id}>
                    {cert.apartments.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => router.push('/mypage')}
              className="text-gray-400 text-sm"
            >
              마이
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 text-sm"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 단지명 */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800">
          {selectedApt?.name}
        </h2>
        <p className="text-gray-400 text-sm">{selectedApt?.address}</p>
      </div>

      {/* 카테고리 탭 */}
      <div className="max-w-lg mx-auto px-4">
        <div className="flex gap-2 mb-4">
          {['자유', '민원', '나눔'].map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/${selectedApt?.id}/${cat}`)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 글쓰기 버튼 */}
      <button
        onClick={() => router.push(`/${selectedApt?.id}/write`)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg text-2xl hover:bg-blue-600 transition flex items-center justify-center"
      >
        ✏️
      </button>
    </div>
  )
}