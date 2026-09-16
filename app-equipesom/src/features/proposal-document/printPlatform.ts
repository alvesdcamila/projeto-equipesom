export type ProposalPrintPlatform = 'ios-webkit'

interface PrintNavigatorSource {
  maxTouchPoints?: number
  platform?: string
  userAgent?: string
}

export function detectProposalPrintPlatform(
  source: PrintNavigatorSource | undefined = typeof navigator === 'undefined' ? undefined : navigator,
): ProposalPrintPlatform | undefined {
  if (!source) return undefined

  const userAgent = source.userAgent ?? ''
  const isAppleWebKit = /AppleWebKit/i.test(userAgent)
  const isIOSDevice = /iPad|iPhone|iPod/i.test(userAgent)
  const isIPadWithDesktopUserAgent = source.platform === 'MacIntel'
    && (source.maxTouchPoints ?? 0) > 1

  return isAppleWebKit && (isIOSDevice || isIPadWithDesktopUserAgent)
    ? 'ios-webkit'
    : undefined
}
