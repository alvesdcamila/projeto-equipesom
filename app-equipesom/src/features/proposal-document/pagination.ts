export interface MeasuredPaginationBlock {
  id: string
  height: number
  keepWithNext?: boolean
}

export interface PaginationOptions {
  continuationPageCapacity: number
  firstPageCapacity: number
  gap: number
}

export interface PaginationPage {
  blockIds: string[]
  capacity: number
  overflowed: boolean
  usedHeight: number
}

function getKeepTogetherHeight(
  blocks: MeasuredPaginationBlock[],
  startIndex: number,
  gap: number,
): number {
  let endIndex = startIndex
  while (blocks[endIndex]?.keepWithNext && endIndex + 1 < blocks.length) {
    endIndex += 1
  }

  return blocks
    .slice(startIndex, endIndex + 1)
    .reduce((total, block, index) => total + block.height + (index === 0 ? 0 : gap), 0)
}

export function paginateMeasuredBlocks(
  blocks: MeasuredPaginationBlock[],
  options: PaginationOptions,
): PaginationPage[] {
  if (blocks.length === 0) return []

  const pages: PaginationPage[] = []
  let blockIndex = 0

  while (blockIndex < blocks.length) {
    const capacity = pages.length === 0
      ? options.firstPageCapacity
      : options.continuationPageCapacity
    const page: PaginationPage = {
      blockIds: [],
      capacity,
      overflowed: false,
      usedHeight: 0,
    }

    while (blockIndex < blocks.length) {
      const block = blocks[blockIndex]
      const precedingGap = page.blockIds.length === 0 ? 0 : options.gap
      const keepTogetherHeight = getKeepTogetherHeight(blocks, blockIndex, options.gap)
      const keepTogetherFitsFreshPage = keepTogetherHeight <= capacity
      const keepTogetherFitsCurrentPage = page.usedHeight + precedingGap + keepTogetherHeight <= capacity

      if (
        page.blockIds.length > 0
        && block.keepWithNext
        && keepTogetherFitsFreshPage
        && !keepTogetherFitsCurrentPage
      ) {
        break
      }

      const requiredHeight = precedingGap + block.height
      if (page.blockIds.length > 0 && page.usedHeight + requiredHeight > capacity) {
        break
      }

      page.blockIds.push(block.id)
      page.usedHeight += requiredHeight
      page.overflowed ||= page.usedHeight > capacity
      blockIndex += 1
    }

    // Um bloco maior que uma folha continua visível e é sinalizado; nunca é descartado.
    if (page.blockIds.length === 0) {
      const oversizedBlock = blocks[blockIndex]
      page.blockIds.push(oversizedBlock.id)
      page.usedHeight = oversizedBlock.height
      page.overflowed = true
      blockIndex += 1
    }

    pages.push(page)
  }

  return pages
}
