import React from 'react'

export function AppHero({
  children,
  subtitle,
  title,
  variant = 'default',
}: {
  children?: React.ReactNode
  subtitle?: React.ReactNode
  title?: React.ReactNode
  variant?: 'default' | 'depin' | 'minimal'
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'depin':
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 py-16 lg:py-24'
      case 'minimal':
        return 'py-12 lg:py-16'
      default:
        return 'py-8 md:py-16 lg:py-20'
    }
  }

  return (
    <section className={`relative overflow-hidden ${getVariantClasses()}`}>
      {variant === 'depin' && (
        <>
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </>
      )}

      <div className="relative flex flex-row justify-center">
        <div className="text-center max-w-4xl px-4">
          <div className="space-y-6">
            {typeof title === 'string' ? (
              <h1 className={`font-bold leading-tight ${
                variant === 'depin'
                  ? 'text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent'
                  : 'text-4xl md:text-5xl lg:text-6xl'
              }`}>
                {title}
              </h1>
            ) : (
              title
            )}
            {typeof subtitle === 'string' ? (
              <p className={`leading-relaxed max-w-3xl mx-auto ${
                variant === 'depin'
                  ? 'text-xl md:text-2xl text-slate-600 dark:text-slate-300'
                  : 'text-lg md:text-xl lg:text-2xl text-muted-foreground'
              }`}>
                {subtitle}
              </p>
            ) : (
              subtitle
            )}
            {children && (
              <div className="pt-6">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
