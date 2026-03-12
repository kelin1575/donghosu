export type Category = '자유' | '민원' | '나눔'

export interface Apartment {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  radius: number
  created_at: string
}

export interface Certification {
  id: string
  user_id: string
  apartment_id: string
  dong: string
  ho: string
  certified_at: string
  expires_at: string
  is_active: boolean
}

export interface Post {
  id: string
  user_id: string
  apartment_id: string
  category: Category
  content: string
  anonymous_tag: string
  like_count: number
  report_count: number
  is_hidden: boolean
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  anonymous_tag: string
  report_count: number
  is_hidden: boolean
  created_at: string
}
```

---

### 3. 파일 구조 확인
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts  ✅
│       └── server.ts  ✅
├── middleware.ts       ✅
└── types/
    └── index.ts       ✅