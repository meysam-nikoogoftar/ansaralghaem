export interface HomeSlide {
  id: number
  image: string
  title: string
  summary: string
  link: string
  badge?: string
  btnLabel?: string
}
export interface HomePhoto {
  id: number
  image: string
  title: string
  category: string
  featured: boolean
}
export interface HomeNews {
  id: number
  title: string
  image: string | null
  content?: string
  excerpt?: string
  date?: string
  category?: string
  published_at?: string | null
  link?: string
}
export interface HomeTrip {
  id: number
  title: string
  registration_open: boolean
  is_active: boolean
  conditions: string
  start_date: string
  end_date: string
  cost: number
}
export interface HomeContribution {
  id: number
  is_active: boolean
  is_public: boolean
  progress_percent: number
  total_amount: number
}
export interface HomeData {
  sliders: HomeSlide[]
  news: HomeNews[]
  gallery: HomePhoto[]
  trips: HomeTrip[]
  contributions: HomeContribution[]
}
