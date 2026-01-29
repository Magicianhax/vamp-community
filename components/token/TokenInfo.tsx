'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink, TrendingUp, TrendingDown, Users, Droplets, Zap } from 'lucide-react'

const CONTRACT_ADDRESS = 'BFuy9AJYKekZ2hik7b5mPhsunGscegi9vPY2bwzzBAGS'
const DEXSCREENER_API = `https://api.dexscreener.com/latest/dex/tokens/${CONTRACT_ADDRESS}`

interface TokenData {
  priceUsd: string
  priceChange24h: number
  volume24h: number
  liquidity: number
  marketCap: number
  pairAddress: string
  dexId: string
}

export function TokenInfo() {
  const [copied, setCopied] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTokenData() {
      try {
        const res = await fetch(DEXSCREENER_API)
        const data = await res.json()
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0]
          setTokenData({
            priceUsd: pair.priceUsd || '0',
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            marketCap: pair.fdv || 0,
            pairAddress: pair.pairAddress || '',
            dexId: pair.dexId || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch token data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()
    const interval = setInterval(fetchTokenData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Contract Address Card */}
      <motion.div
        className="bg-gradient-to-r from-red-950/50 via-black to-red-950/50 border border-red-500/30 rounded-2xl p-6 mb-6 backdrop-blur-sm"
        whileHover={{ borderColor: 'rgba(255, 0, 0, 0.6)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-1">Contract Address</p>
            <p className="text-gray-300 font-mono text-sm md:text-base break-all">
              {CONTRACT_ADDRESS}
            </p>
          </div>
          <motion.button
            onClick={copyAddress}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
      </motion.div>

      {/* Token Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-black/50 border border-red-500/20 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-red-500/20 rounded mb-2 w-20" />
              <div className="h-8 bg-red-500/20 rounded w-24" />
            </div>
          ))
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                <Zap className="w-4 h-4" />
                Price
              </div>
              <p className="text-2xl font-bold text-white">
                ${parseFloat(tokenData?.priceUsd || '0').toFixed(6)}
              </p>
              {tokenData && (
                <div className={`flex items-center gap-1 text-sm mt-1 ${tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tokenData.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}%
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Market Cap
              </div>
              <p className="text-2xl font-bold text-white">
                {formatNumber(tokenData?.marketCap || 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                <Users className="w-4 h-4" />
                24h Volume
              </div>
              <p className="text-2xl font-bold text-white">
                {formatNumber(tokenData?.volume24h || 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                <Droplets className="w-4 h-4" />
                Liquidity
              </div>
              <p className="text-2xl font-bold text-white">
                {formatNumber(tokenData?.liquidity || 0)}
              </p>
            </motion.div>
          </>
        )}
      </div>

      {/* Buy/Trade Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <motion.a
          href={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 0, 0, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-xl font-bold"
        >
          <ExternalLink className="w-5 h-5" />
          DexScreener
        </motion.a>

        <motion.a
          href={`https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-xl font-bold"
        >
          <Zap className="w-5 h-5" />
          Buy on Raydium
        </motion.a>

        <motion.a
          href={`https://jup.ag/swap/SOL-${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-3 rounded-xl font-bold"
        >
          <Zap className="w-5 h-5" />
          Buy on Jupiter
        </motion.a>

        <motion.a
          href={`https://solscan.io/token/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl font-bold"
        >
          <ExternalLink className="w-5 h-5" />
          Solscan
        </motion.a>
      </div>
    </motion.div>
  )
}
