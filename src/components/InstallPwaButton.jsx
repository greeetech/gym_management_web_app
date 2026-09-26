import { useState } from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'
import { Icon } from './icons'
import { Button } from './ui/button'
import Modal from './Modal'
import { cn } from '../lib/utils'

export default function InstallPwaButton({ className, collapsed = false }) {
  const { isInstallable, isInstalled, installApp } = usePWAInstall()
  const [showGuide, setShowGuide] = useState(false)

  if (isInstalled) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted-foreground',
          collapsed ? 'justify-center p-2' : '',
          className,
        )}
        title="Application is installed and running natively"
      >
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        {!collapsed && <span>App Installed</span>}
      </div>
    )
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await installApp()
      if (!installed) {
        setShowGuide(true)
      }
    } else {
      setShowGuide(true)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'group relative flex w-full items-center gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-2.5 text-xs font-semibold text-brand-600 transition-all hover:border-brand-500 hover:bg-brand-500 hover:text-white dark:text-brand-400 dark:hover:text-white',
          collapsed ? 'justify-center p-2.5' : '',
          className,
        )}
        title="Install Gym Manager on this device (Desktop/Mobile)"
      >
        <Icon name="smartphone" className="size-4 shrink-0 transition-transform group-hover:scale-110" />
        {!collapsed && (
          <div className="flex flex-col items-start leading-tight text-left">
            <span>Install Web App</span>
            <span className="text-[10px] font-normal opacity-80">Add to Home Screen</span>
          </div>
        )}
      </button>

      <Modal open={showGuide} onClose={() => setShowGuide(false)} title="Install Gym Manager">
        <div className="space-y-4 text-sm text-foreground">
          <p className="text-xs text-muted-foreground">
            Install this app directly onto your mobile phone or computer for fast offline access and a native fullscreen experience.
          </p>

          <div className="space-y-3 py-1">
            <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1">
              <p className="font-semibold text-xs uppercase tracking-wider text-brand-500">On Chrome / Edge / Desktop:</p>
              <p className="text-xs text-muted-foreground">
                Look for the <strong>Install</strong> icon in your browser address bar on the top right, or click the 3-dots menu &rarr; <strong>Install Gym Manager</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1">
              <p className="font-semibold text-xs uppercase tracking-wider text-brand-500">On Android:</p>
              <p className="text-xs text-muted-foreground">
                Tap the three dots in Chrome &rarr; tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1">
              <p className="font-semibold text-xs uppercase tracking-wider text-brand-500">On iPhone / iPad (Safari):</p>
              <p className="text-xs text-muted-foreground">
                Tap the <strong>Share</strong> button at the bottom &rarr; scroll down &rarr; tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="default" onClick={() => setShowGuide(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
