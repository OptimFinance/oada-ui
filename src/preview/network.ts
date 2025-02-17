export const eraStartPosixTime = 1666915215
export const eraStartSlot = 259215

export const epochBoundary = 1647899091000n
export const epochLength = 1_800_000n
export const epochBoundaryAsEpoch = 327

export const explorerTokenPath = 'https://preview.cardanoscan.io/token'
export const explorerStakeKeyPath = 'https://preview.cardanoscan.io/stakeKey'
export const explorerName = 'Cardanoscan'

export const getExplorerTokenUrl = (
  cs: string,
  tokenName: string
): string => {
  return `${explorerTokenPath}/${cs}.${tokenName}`
}

export const getTokenHoldersExplorerUrl = (
  cs: string,
  tokenName: string
): string => {
  return `${getExplorerTokenUrl(cs, tokenName)}?tab=topholders`
}

export const getExplorerStakeKeyUrl = (
  stakeAddress: string
): string => {
  return `${explorerStakeKeyPath}/${stakeAddress}`
}
