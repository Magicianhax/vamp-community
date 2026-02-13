import { NextRequest, NextResponse } from 'next/server'

const BAGS_API_KEY = process.env.BAGS_API_KEY
const BAGS_API_BASE = 'https://public-api-v2.bags.fm/api/v1'
const VAMP_TOKEN_MINT = 'BFuy9AJYKekZ2hik7b5mPhsunGscegi9vPY2bwzzBAGS'

export async function GET(request: NextRequest) {
  if (!BAGS_API_KEY) {
    return NextResponse.json(
      { error: 'BAGS_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    // Get lifetime fees and claim stats in parallel
    const [lifetimeFeesResponse, claimStatsResponse] = await Promise.all([
      fetch(
        `${BAGS_API_BASE}/token-launch/lifetime-fees?tokenMint=${VAMP_TOKEN_MINT}`,
        {
          headers: {
            'x-api-key': BAGS_API_KEY,
          },
        }
      ),
      fetch(
        `${BAGS_API_BASE}/token-launch/claim-stats?tokenMint=${VAMP_TOKEN_MINT}`,
        {
          headers: {
            'x-api-key': BAGS_API_KEY,
          },
        }
      )
    ])

    if (!lifetimeFeesResponse.ok) {
      throw new Error(`Lifetime fees API error: ${lifetimeFeesResponse.statusText}`)
    }

    // Parse both JSON responses in parallel
    const [lifetimeFeesData, claimStatsData] = await Promise.all([
      lifetimeFeesResponse.json(),
      claimStatsResponse.ok ? claimStatsResponse.json() : Promise.resolve(null)
    ])

    const lifetimeFeesLamports = lifetimeFeesData.success 
      ? BigInt(lifetimeFeesData.response || '0')
      : BigInt(0)

    let totalClaimedLamports = BigInt(0)
    let claimStats: any[] = []

    if (claimStatsData && claimStatsData.success && Array.isArray(claimStatsData.response)) {
      claimStats = claimStatsData.response
      // Sum up all claimed amounts
      totalClaimedLamports = claimStats.reduce((sum, stat) => {
        return sum + BigInt(stat.totalClaimed || '0')
      }, BigInt(0))
    }

    // Calculate unclaimed fees
    const unclaimedLamports = lifetimeFeesLamports > totalClaimedLamports
      ? lifetimeFeesLamports - totalClaimedLamports
      : BigInt(0)

    // Convert to SOL (1 SOL = 1,000,000,000 lamports)
    const LAMPORTS_PER_SOL = 1_000_000_000
    const lifetimeFeesSol = Number(lifetimeFeesLamports) / LAMPORTS_PER_SOL
    const totalClaimedSol = Number(totalClaimedLamports) / LAMPORTS_PER_SOL
    const unclaimedSol = Number(unclaimedLamports) / LAMPORTS_PER_SOL

    return NextResponse.json({
      success: true,
      data: {
        lifetimeFees: lifetimeFeesSol,
        totalClaimed: totalClaimedSol,
        unclaimed: unclaimedSol,
        lifetimeFeesLamports: lifetimeFeesLamports.toString(),
        totalClaimedLamports: totalClaimedLamports.toString(),
        unclaimedLamports: unclaimedLamports.toString(),
        claimStats: claimStats.map(stat => ({
          wallet: stat.wallet,
          username: stat.username || stat.providerUsername,
          provider: stat.provider,
          pfp: stat.pfp,
          isCreator: stat.isCreator,
          royaltyBps: stat.royaltyBps,
          totalClaimed: Number(BigInt(stat.totalClaimed || '0')) / LAMPORTS_PER_SOL,
        })),
      },
    })
  } catch (error: any) {
    console.error('Error fetching Bags fees:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch fee data',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
