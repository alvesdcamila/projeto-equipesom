export function formatCityState(city: string, state?: string): string {
  const normalizedCity = city.trim()
  const normalizedState = state?.trim().toLocaleUpperCase('pt-BR') ?? ''
  if (!normalizedCity) return normalizedState
  return normalizedState ? `${normalizedCity}/${normalizedState}` : normalizedCity
}
