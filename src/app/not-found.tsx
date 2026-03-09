'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [glitchText, setGlitchText] = useState('404')
  const [errorCode, setErrorCode] = useState(404)

  useEffect(() => {
    const errors = [404, 500, 403, 401, 503]
    const glitchTexts = ['404', 'ERR_404', 'NOT_FOUND', 'MISSING', 'VOID']
    
    const interval = setInterval(() => {
      setErrorCode(errors[Math.floor(Math.random() * errors.length)])
      setGlitchText(glitchTexts[Math.floor(Math.random() * glitchTexts.length)])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #000000 0px, transparent 1px, transparent 2px, #000000 3px),
            repeating-linear-gradient(90deg, #000000 0px, transparent 1px, transparent 2px, #000000 3px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Error Code Display */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-black font-mono text-9xl font-bold tracking-wider">
              {errorCode}
            </h1>
            <div className="absolute inset-0 text-red-500 font-mono text-9xl font-bold tracking-wider opacity-50 animate-pulse">
              {glitchText}
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-12">
          <h2 className="text-black font-mono text-2xl mb-4 border-b-4 border-black pb-2">
            SHAPE NOT FOUND
          </h2>
          <p className="text-black/60 font-mono text-sm max-w-md">
            The requested 3D shape or scene configuration does not exist in the FORMA database.
            This spatial anomaly has been logged for analysis.
          </p>
        </div>

        {/* System Status */}
        <div className="border-4 border-black bg-white p-6 mb-8">
          <div className="space-y-2 text-xs font-mono text-black/60">
            <div>ERROR_CODE: {glitchText}</div>
            <div>STATUS: LOST_IN_SPACE</div>
            <div>RECOVERY: ATTEMPTING_RECALIBRATION</div>
            <div>TIME_STAMP: {new Date().toISOString()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4">
          <Link 
            href="/"
            className="border-4 border-black bg-white text-black px-8 py-4 font-mono text-lg font-bold hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            [ RETURN_TO_FORMA ]
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-gray-300 text-black px-6 py-3 font-mono text-sm hover:border-black transition-all"
          >
            RELOAD_DIMENSION
          </button>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-8 right-8 text-black/20 font-mono text-xs">
          SYS.ERROR.404 // V.1.4.3
        </div>
        
        <div className="absolute bottom-8 left-8 writing-mode-vertical text-black/40 font-mono text-xs tracking-wider">
          ERROR.LOG // DIMENSION_MISMATCH // SPATIAL_ANOMALY_DETECTED
        </div>
      </div>

      {/* Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px)',
        }} />
      </div>
    </div>
  )
}
