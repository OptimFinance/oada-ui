export const eraStartPosixTime = 1596491091
export const eraStartSlot = 4924800

export const epochBoundary = 1647899091000n
export const epochLength = 432_000_000n
export const epochBoundaryAsEpoch = 327

export const explorerTokenPath = 'https://cardanoscan.io/token'
export const explorerStakeKeyPath = 'https://cardanoscan.io/stakeKey'
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
