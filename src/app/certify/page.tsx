'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Apartment } from '@/types'

export default function CertifyPage() {
  const [step, setStep] = useState<'gps' | 'dong' | 'complete'>('gps')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nearbyApt, setNearbyApt] = useState<Apartment | null>(null)
  const [dong, setDong] = useState('')
  const [ho, setHo] = useState('')
  const [userCerts, setUserCerts] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    loadUserCerts()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/auth/login')
  }

  const loadUserCerts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('certifications')
      .select('*, apartments(name)')
      .eq('user_id', user.id)
      .eq('is_active', true)

    setUserCerts(data || [])
  }

  // 거리 계산 (Haversine 공식)
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const handleGPS = async () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('GPS를 지원하지 않는 브라우저입니다')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // DB에서 모든 아파트 가져와서 반경 내 찾기
        const { data: apartments } = await supabase
          .from('apartments')
          .select('*')

        if (!apartments || apartments.length === 0) {
          setError('등록된 아파트 단지가 없습니다')
          setLoading(false)
          return
        }

        const nearby = apartments.find((apt: Apartment) => {
          const distance = getDistance(latitude, longitude, apt.lat, apt.lng)
          return distance <= apt.radius
        })

        if (!nearby) {
          setError('근처에 등록된 아파트 단지가 없습니다\n현재 위치를 확인해주세요')
          setLoading(false)
          return
        }

        // 이미 인증된 단지인지 확인
        const alreadyCertified = userCerts.find(
          (cert) => cert.apartment_id === nearby.id
        )
        if (alreadyCertified) {
          setError('이미 인증된 단지입니다')
          setLoading(false)
          return
        }

        // 최대 2개 단지 제한
        if (userCerts.length >= 2) {
          setError('최대 2개 단지까지 인증 가능합니다')
          setLoading(false)
          return
        }

        setNearbyApt(nearby)
        setStep('dong')
        setLoading(false)
      },
      (err) => {
        setError('위치 접근이 거부됐습니다\n브라우저 설정에서 위치 권한을 허용해주세요')
        setLoading(false)
      }
    )
  }

  const handleCertify = async () => {
    if (!nearbyApt || !dong || !ho) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 3)

    const { error } = await supabase
      .from('certifications')
      .insert({
        user_id: user.id,
        apartment_id: nearbyApt.id,
        dong,
        ho,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })

    if (error) {
      setError('인증 중 오류가 발생했습니다')
      setLoading(false)
      return
    }

    setStep('complete')
    setLoading(false)
  }

  // Step 1: GPS 인증
  if (step === 'gps') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-500">동호수</h1>
            <p className="text-gray-400 text-sm mt-1">단지 인증</p>
          </div>

          {/* 인증된 단지 목록 */}
          {userCerts.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">인증된 단지</p>
              {userCerts.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    {cert.apartments.name} {cert.dong}동 {cert.ho}호
                  </span>
                  <span className="text-xs text-blue-400">인증완료</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-gray-600 mb-2">현재 위치로 단지를 인증합니다</p>
            <p className="text-gray-400 text-sm mb-8">
              단지 반경 200m 이내에서 인증 가능합니다
            </p>

            {error && (
              <p className="text-red-500 text-sm mb-4 whitespace-pre-line">{error}</p>
            )}

            <button
              onClick={handleGPS}
              disabled={loading || userCerts.length >= 2}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '위치 확인 중...' : '내 위치로 단지 찾기'}
            </button>

            {userCerts.length > 0 && (
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 mt-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                홈으로 가기
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Step 2: 동호수 입력
  if (step === 'dong') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-500">동호수</h1>
            <p className="text-gray-400 text-sm mt-1">단지 인증</p>
          </div>

          <div className="bg-blue-50 px-4 py-3 rounded-xl mb-6 text-center">
            <p className="text-blue-700 font-medium">{nearbyApt?.name}</p>
            <p className="text-blue-400 text-sm">단지가 확인됐습니다</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">동</label>
              <input
                type="number"
                value={dong}
                onChange={(e) => setDong(e.target.value)}
                placeholder="동 번호 입력"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">호수</label>
              <input
                type="number"
                value={ho}
                onChange={(e) => setHo(e.target.value)}
                placeholder="호수 입력"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleCertify}
              disabled={loading || !dong || !ho}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '인증 중...' : '인증 완료'}
            </button>

            <button
              onClick={() => setStep('gps')}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              뒤로
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: 완료
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">인증 완료!</h2>
        <p className="text-gray-500 text-sm mb-2">
          {nearbyApt?.name} {dong}동 {ho}호
        </p>
        <p className="text-gray-400 text-xs mb-8">
          3개월 후 재인증이 필요합니다
        </p>
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition"
        >
          홈으로 가기
        </button>
      </div>
    </div>
  )
}