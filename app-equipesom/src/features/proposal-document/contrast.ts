function channelToLinear(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hexColor: string): number {
  const color = hexColor.replace('#', '')
  const channels = [0, 2, 4].map((index) => Number.parseInt(color.slice(index, index + 2), 16))
  return 0.2126 * channelToLinear(channels[0])
    + 0.7152 * channelToLinear(channels[1])
    + 0.0722 * channelToLinear(channels[2])
}

export function mixHexColors(firstColor: string, secondColor: string, firstWeight: number): string {
  const first = firstColor.replace('#', '')
  const second = secondColor.replace('#', '')
  const channels = [0, 2, 4].map((index) => {
    const firstChannel = Number.parseInt(first.slice(index, index + 2), 16)
    const secondChannel = Number.parseInt(second.slice(index, index + 2), 16)
    return Math.round(firstChannel * firstWeight + secondChannel * (1 - firstWeight))
      .toString(16)
      .padStart(2, '0')
  })
  return `#${channels.join('')}`
}

export function getContrastRatio(firstColor: string, secondColor: string): number {
  const lighter = Math.max(relativeLuminance(firstColor), relativeLuminance(secondColor))
  const darker = Math.min(relativeLuminance(firstColor), relativeLuminance(secondColor))
  return (lighter + 0.05) / (darker + 0.05)
}
