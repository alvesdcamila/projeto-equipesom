import { Check, Info, Minus, Plus } from 'lucide-react'
import { FieldError } from '../../../components/forms/FieldError'
import {
  getEquipmentById,
  inventoryCategories,
  inventoryEquipment,
} from '../../../data/inventoryEquipment'
import { serviceCatalog } from '../../../data/services'
import type { ProposalStepProps } from '../types'

export function ServicesStep({ draft, onChange, errors }: ProposalStepProps) {
  const selectedEquipmentIds = new Set(draft.equipmentItems.map((item) => item.catalogItemId))

  const toggleEquipment = (catalogItemId: string) => {
    const nextItems = selectedEquipmentIds.has(catalogItemId)
      ? draft.equipmentItems.filter((item) => item.catalogItemId !== catalogItemId)
      : [...draft.equipmentItems, { catalogItemId, quantity: 1 }]
    onChange('equipmentItems', nextItems)
  }

  const updateEquipmentQuantity = (catalogItemId: string, quantity: number) => {
    onChange(
      'equipmentItems',
      draft.equipmentItems.map((item) =>
        item.catalogItemId === catalogItemId ? { ...item, quantity } : item,
      ),
    )
  }

  const toggleService = (serviceId: string) => {
    const nextServices = draft.serviceIds.includes(serviceId)
      ? draft.serviceIds.filter((id) => id !== serviceId)
      : [...draft.serviceIds, serviceId]
    onChange('serviceIds', nextServices)
  }

  const legacySelections = draft.equipmentItems.filter(
    (selection) => !inventoryEquipment.some((item) => item.id === selection.catalogItemId),
  )

  const renderEquipmentCard = (catalogItemId: string, legacy = false) => {
    const item = getEquipmentById(catalogItemId)
    if (!item) return null
    const selection = draft.equipmentItems.find((selected) => selected.catalogItemId === catalogItemId)
    const selected = Boolean(selection)

    return (
      <article className={selected ? 'equipment-card is-selected' : 'equipment-card'} key={item.id}>
        <label className="equipment-card__select">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleEquipment(item.id)}
          />
          <span className="catalog-card__check"><Check size={15} /></span>
          <span className="equipment-card__body">
            <span className="equipment-card__title">
              <strong>{item.normalizedName}</strong>
              <small>{item.id}</small>
            </span>
            <span>{item.informedBrandModel}</span>
            <small>{item.informedSpecification}</small>
          </span>
        </label>

        <div className="equipment-card__meta">
          <span className={legacy ? 'data-state data-state--legacy' : 'data-state'}>{item.dataState}</span>
          {!legacy && (
            <span className="inventory-quantity">
              Quantidade informada no inventário: <strong>{item.reportedQuantity} {item.inventoryUnit}</strong>
            </span>
          )}
        </div>

        {selected && (
          <div className="quantity-control">
            <span>Quantidade na proposta</span>
            <div>
              <button
                type="button"
                onClick={() => updateEquipmentQuantity(item.id, Math.max(1, (selection?.quantity ?? 1) - 1))}
                aria-label={`Diminuir quantidade de ${item.normalizedName}`}
              >
                <Minus size={15} />
              </button>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={selection?.quantity ?? 1}
                onChange={(event) => updateEquipmentQuantity(item.id, Number(event.target.value))}
                aria-label={`Quantidade de ${item.normalizedName} na proposta`}
              />
              <button
                type="button"
                onClick={() => updateEquipmentQuantity(item.id, (selection?.quantity ?? 1) + 1)}
                aria-label={`Aumentar quantidade de ${item.normalizedName}`}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        )}
      </article>
    )
  }

  return (
    <div className="step-content">
      <div className="step-heading">
        <span className="eyebrow">Monte o escopo</span>
        <h2>Equipamentos e serviços</h2>
        <p>Selecione cada equipamento e informe a quantidade desejada. Serviços permanecem em um bloco separado.</p>
      </div>

      <div className="info-banner">
        <Info size={19} />
        <p>Inventário preliminar: quantidades informadas não representam disponibilidade confirmada e não bloqueiam a seleção.</p>
      </div>

      <div
        className={`catalog-groups ${errors.equipmentItems ? 'is-invalid' : ''}`}
        aria-invalid={Boolean(errors.equipmentItems)}
        aria-describedby={errors.equipmentItems ? 'equipmentItems-error' : undefined}
        tabIndex={errors.equipmentItems ? -1 : undefined}
      >
        <FieldError id="equipmentItems-error" message={errors.equipmentItems} />

        {legacySelections.length > 0 && (
          <section className="catalog-block catalog-block--legacy">
            <div className="catalog-group__heading">
              <div><span className="eyebrow">Compatibilidade</span><h3>Itens preservados do rascunho anterior</h3></div>
              <span>{legacySelections.length} {legacySelections.length === 1 ? 'selecionado' : 'selecionados'}</span>
            </div>
            <p className="catalog-block__note">Estes itens genéricos não fazem parte do novo catálogo, mas foram mantidos para não apagar dados já salvos.</p>
            <div className="equipment-list">
              {legacySelections.map((selection) => renderEquipmentCard(selection.catalogItemId, true))}
            </div>
          </section>
        )}

        {inventoryCategories.map((category) => {
          const categoryItems = inventoryEquipment.filter((item) => item.category === category)
          const selectedCount = categoryItems.filter((item) => selectedEquipmentIds.has(item.id)).length
          return (
            <section className="catalog-block" key={category}>
              <div className="catalog-group__heading">
                <h3>{category}</h3>
                <span>{selectedCount} {selectedCount === 1 ? 'selecionado' : 'selecionados'}</span>
              </div>
              <div className="equipment-list">
                {categoryItems.map((item) => renderEquipmentCard(item.id))}
              </div>
            </section>
          )
        })}

        <section className="catalog-block catalog-block--services">
          <div className="catalog-group__heading">
            <h3>Serviços</h3>
            <span>{draft.serviceIds.length} {draft.serviceIds.length === 1 ? 'selecionado' : 'selecionados'}</span>
          </div>
          <div className="catalog-list">
            {serviceCatalog.map((service) => {
              const selected = draft.serviceIds.includes(service.id)
              return (
                <label className={selected ? 'catalog-card is-selected' : 'catalog-card'} key={service.id}>
                  <input type="checkbox" checked={selected} onChange={() => toggleService(service.id)} />
                  <span className="catalog-card__check"><Check size={15} /></span>
                  <span className="catalog-card__body">
                    <strong>{service.name}</strong>
                    <small>{service.description}</small>
                  </span>
                </label>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
