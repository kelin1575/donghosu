'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MyPage() {
  const [user, setUser] = useState<any>(null)
  const [certs, setCerts] = useState<any[]>([])
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'certs'>('posts')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)

    // 인증 단지 목록
    const { data: certData } = await supabase
      .from('certifications')
      .select('*, apartments(name, address)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('certified_at', { ascending: false })
    setCerts(certData || [])

    // 내 게시글
    const { data: postData } = await supabase
      .from('posts')
      .select('*, apartments(name)')
      .eq('user_id', user.id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
    setMyPosts(postData || [])

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return

    await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    setMyPosts(myPosts.filter(p => p.id !== postId))
  }

  const handleDeactivateCert = async (certId: string) => {
    if (!confirm('단지 인증을 해제하시겠습니까?')) return

    await supabase
      .from('certifications')
      .update({ is_active: false })
      .eq('id', certId)

    setCerts(certs.filter(c => c.id !== certId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime()
    return Math.floor(diff / 86400000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-300">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 text-sm"
          >
            ← 홈
          </button>
          <h2 className="font-bold text-gray-800">마이페이지</h2>
          <button
            onClick={handleLogout}
            className="text-gray-400 text-sm"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">내 계정</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              🏠
            </div>
          </div>
        </div>

        {/* 인증 단지 현황 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">인증 단지</h3>
            {certs.length < 2 && (
              <button
                onClick={() => router.push('/certify')}
                className="text-blue-500 text-sm font-medium"
              >
                + 단지 추가
              </button>
            )}
          </div>

          {certs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-3">인증된 단지가 없습니다</p>
              <button
                onClick={() => router.push('/certify')}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium"
              >
                단지 인증하기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map((cert) => {
                const daysLeft = getDaysUntilExpiry(cert.expires_at)
                const isExpiringSoon = daysLeft <= 7

                return (
                  <div key={cert.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {cert.apartments.name}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {cert.dong}동 {cert.ho}호
                        </p>
                        <p className={`text-xs mt-1 ${
                          isExpiringSoon ? 'text-red-400' : 'text-gray-300'
                        }`}>
                          {isExpiringSoon
                            ? `⚠️ ${daysLeft}일 후 재인증 필요`
                            : `${daysLeft}일 후 재인증`
                          }
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {isExpiringSoon && (
                          <button
                            onClick={() => router.push('/certify')}
                            className="text-xs text-blue-500 font-medium"
                          >
                            재인증
                          </button>
                        )}
                        <button
                          onClick={() => handleDeactivateCert(cert.id)}
                          className="text-xs text-gray-300"
                        >
                          해제
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === 'posts'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            내 글 {myPosts.length}
          </button>
        </div>

        {/* 내 게시글 목록 */}
        {myPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300">작성한 글이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/${post.apartment_id}/${post.category}`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-blue-50 text-blue-400 px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-300">
                        {post.apartments.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-300">
                        ❤️ {post.like_count}
                      </span>
                      <span className="text-xs text-gray-300">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-gray-200 text-xs ml-3 hover:text-red-400 transition"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}