'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors={true}
      closeButton={false}
      duration={4000}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      toastOptions={{
        className: 'toast-custom',
        style: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: '0',
          margin: '0',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
