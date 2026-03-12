'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

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

export default function PostPage() {
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [isCertified, setIsCertified] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const aptId = params.aptId as string
  const postId = params.postId as string
  const supabase = createClient()

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    // 인증 확인
    if (user) {
      const { data: cert } = await supabase
        .from('certifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('apartment_id', aptId)
        .eq('is_active', true)
        .single()
      setIsCertified(!!cert)

      // 좋아요 여부
      const { data: like } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()
      setIsLiked(!!like)
    }

    // 게시글
    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
    setPost(postData)

    // 댓글
    const { data: commentData } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })
    setComments(commentData || [])

    setLoading(false)
  }

  const handleLike = async () => {
    if (!currentUser || !isCertified) return

    if (isLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('post_id', postId)

      await supabase
        .from('posts')
        .update({ like_count: post.like_count - 1 })
        .eq('id', postId)

      setPost({ ...post, like_count: post.like_count - 1 })
      setIsLiked(false)
    } else {
      await supabase
        .from('likes')
        .insert({ user_id: currentUser.id, post_id: postId })

      await supabase
        .from('posts')
        .update({ like_count: post.like_count + 1 })
        .eq('id', postId)

      setPost({ ...post, like_count: post.like_count + 1 })
      setIsLiked(true)
    }
  }

  const handleReport = async (targetType: 'post' | 'comment', targetId: string) => {
    if (!currentUser) return

    await supabase
      .from('reports')
      .insert({
        reporter_id: currentUser.id,
        target_type: targetType,
        target_id: targetId,
        reason: '부적절한 내용',
      })

    alert('신고가 접수됐습니다')
  }

  const handleComment = async () => {
    if (!newComment.trim() || !currentUser) return
    setCommentLoading(true)

    const anonymousTag = generateTag(currentUser.id, postId + comments.length)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content: newComment.trim(),
        anonymous_tag: anonymousTag,
      })
      .select()
      .single()

    if (!error && data) {
      setComments([...comments, data])
      setNewComment('')
    }

    setCommentLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-300">로딩 중...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">게시글을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-gray-400 text-sm"
          >
            ← 뒤로
          </button>
          <h2 className="font-bold text-gray-800">{post.category}</h2>
          <button
            onClick={() => handleReport('post', postId)}
            className="text-gray-300 text-xs"
          >
            신고
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* 게시글 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-blue-400 font-medium">
              {post.anonymous_tag}
            </span>
            <span className="text-xs text-gray-300">
              {formatDate(post.created_at)}
            </span>
          </div>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* 좋아요 */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <button
              onClick={handleLike}
              disabled={!isCertified}
              className={`flex items-center gap-1 text-sm transition ${
                isLiked ? 'text-red-400' : 'text-gray-300'
              } disabled:cursor-not-allowed`}
            >
              {isLiked ? '❤️' : '🤍'} {post.like_count}
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-400 font-medium">
                  {comment.anonymous_tag}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300">
                    {formatDate(comment.created_at)}
                  </span>
                  <button
                    onClick={() => handleReport('comment', comment.id)}
                    className="text-gray-200 text-xs"
                  >
                    신고
                  </button>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-300 text-sm py-8">
              첫 댓글을 남겨보세요
            </p>
          )}
        </div>
      </div>

      {/* 댓글 입력 (인증된 주민만) */}
      {isCertified && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
          <div className="max-w-lg mx-auto flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="댓글을 입력하세요"
              className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleComment}
              disabled={commentLoading || !newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition"
            >
              {commentLoading ? '...' : '등록'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}