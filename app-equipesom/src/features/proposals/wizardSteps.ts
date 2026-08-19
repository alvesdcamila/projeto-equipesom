import {
  BadgeDollarSign,
  CalendarDays,
  ClipboardCheck,
  PackageCheck,
  ScrollText,
  UserRound,
} from 'lucide-react'

export const wizardSteps = [
  { id: 'cliente', label: 'Cliente', shortLabel: 'Cliente', icon: UserRound },
  { id: 'evento', label: 'Evento', shortLabel: 'Evento', icon: CalendarDays },
  { id: 'itens', label: 'Equipamentos e serviços', shortLabel: 'Itens', icon: PackageCheck },
  { id: 'valores', label: 'Valores', shortLabel: 'Valores', icon: BadgeDollarSign },
  { id: 'condicoes', label: 'Condições', shortLabel: 'Condições', icon: ScrollText },
  { id: 'revisao', label: 'Revisão', shortLabel: 'Revisão', icon: ClipboardCheck },
] as const
