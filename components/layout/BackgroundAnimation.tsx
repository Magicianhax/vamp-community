'use client'

export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern animate-grid-move" />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-40 h-40 border-4 border-black opacity-[0.08] rotate-45 animate-float-shape-1" />
      <div className="absolute top-60 right-20 w-32 h-32 border-4 border-black opacity-[0.08] rotate-12 animate-float-shape-2" />
      <div className="absolute bottom-40 left-1/4 w-48 h-48 border-4 border-black opacity-[0.08] rotate-90 animate-float-shape-3" />
      <div className="absolute top-1/3 right-1/3 w-28 h-28 border-4 border-black opacity-[0.08] animate-float-shape-4" />
      <div className="absolute bottom-1/3 right-10 w-36 h-36 border-4 border-black opacity-[0.08] rotate-45 animate-float-shape-5" />
      
      {/* Animated Circles */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 border-4 border-black rounded-full opacity-[0.06] animate-pulse-circle-1" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 border-4 border-black rounded-full opacity-[0.06] animate-pulse-circle-2" />
      <div className="absolute top-1/2 left-1/2 w-56 h-56 border-4 border-black rounded-full opacity-[0.06] animate-pulse-circle-3" />
    </div>
  )
}
