'use client'

const CONTRACT_ADDRESS = 'BFuy9AJYKekZ2hik7b5mPhsunGscegi9vPY2bwzzBAGS'

export function TokenChart() {
  return (
    <div className="w-full aspect-video border-2 border-black rounded shadow-md overflow-hidden bg-background">
      <iframe
        src={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}?embed=1&theme=dark&trades=0&info=0`}
        className="w-full h-full"
        title="DEX Screener Chart"
        allow="clipboard-write"
      />
    </div>
  )
}
