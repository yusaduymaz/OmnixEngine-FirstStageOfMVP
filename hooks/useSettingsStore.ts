import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'tr' | 'en'
export type Country = 'TR' | 'US' | 'UK' | 'DE' | 'FR' | 'IT' | 'ES'

interface SettingsState {
  language: Language
  country: Country
  setLanguage: (lang: Language) => void
  setCountry: (country: Country) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'tr',
      country: 'TR',
      setLanguage: (language) => set({ language }),
      setCountry: (country) => set({ country }),
    }),
    {
      name: 'contentforge-settings-storage', // localStorage içerisindeki anahtar ismi
    }
  )
)
