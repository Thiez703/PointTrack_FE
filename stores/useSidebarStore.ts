import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SidebarStore {
  isOpen: boolean
  isCollapsed: boolean
  toggleSidebar: () => void
  toggleCollapse: () => void
  setIsOpen: (isOpen: boolean) => void
  setIsCollapsed: (isCollapsed: boolean) => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: false, // For mobile: open/close drawer
      isCollapsed: false, // For desktop: expand/collapse sidebar
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
    }),
    {
      name: 'sidebar-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Only persist collapsed state
    }
  )
)
