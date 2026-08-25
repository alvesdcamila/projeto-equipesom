import { useCallback, useEffect, useRef, useState } from 'react'

export type HeaderPanelId = 'help' | 'notifications' | 'profile'

export function useHeaderPanels() {
  const [openPanel, setOpenPanel] = useState<HeaderPanelId | null>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const closePanel = useCallback((restoreFocus = false) => {
    setOpenPanel(null)
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }
  }, [])

  const togglePanel = useCallback((panel: HeaderPanelId, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger
    setOpenPanel((current) => current === panel ? null : panel)
  }, [])

  useEffect(() => {
    if (!openPanel) return

    const focusFrame = window.requestAnimationFrame(() => panelRef.current?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closePanel(true)
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !actionsRef.current?.contains(event.target)) {
        closePanel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [closePanel, openPanel])

  return {
    actionsRef,
    closePanel,
    openPanel,
    panelRef,
    togglePanel,
  }
}
