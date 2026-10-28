import { computed, reactive } from 'vue'
import { defaultState } from './defaults'
import { prototypeScenarios } from './scenarios'
import type {
  BannerVariant,
  HealthVariant,
  LoanApplication,
  PrototypeStage,
  PrototypeState,
  PrototypeStateOverride,
} from './types'

const STORAGE_KEY = 'ach-prototype-state'
const URL_STAGE_KEY = 'stage'
const URL_MODULES_KEY = 'modules'
const URL_DOCUMENTS_KEY = 'docs'

function mergeState(base: PrototypeState, override?: PrototypeStateOverride): PrototypeState {
  // Clone so live edits never write back into defaultState or a scenario's seed arrays.
  const merged: PrototypeState = structuredClone(base)
  if (!override) return merged

  if (override.stage) merged.stage = override.stage
  if (override.prefilledDocuments !== undefined) merged.prefilledDocuments = override.prefilledDocuments
  if (override.modules) Object.assign(merged.modules, structuredClone(override.modules))
  if (override.data) Object.assign(merged.data, structuredClone(override.data))

  return merged
}

function readInitialState(): PrototypeState {
  if (typeof window === 'undefined') return mergeState(defaultState)

  const params = new URLSearchParams(window.location.search)
  const stageParam = params.get(URL_STAGE_KEY) as PrototypeStage | null
  const modulesParam = params.get(URL_MODULES_KEY)

  if (stageParam) {
    const scenario = prototypeScenarios.find((item) => item.id === stageParam)
    const state = mergeState(defaultState, scenario?.overrides)
    state.stage = scenario?.overrides.stage ?? stageParam
    if (modulesParam !== null) {
      const modules = modulesParam.split(',').filter(Boolean)
      state.modules.partners = modules.includes('partners')
      state.modules.transactions = modules.includes('transactions')
    }
    const documentsParam = params.get(URL_DOCUMENTS_KEY)
    if (documentsParam !== null) state.prefilledDocuments = documentsParam !== 'stage'
    return state
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return mergeState(defaultState)

  try {
    const parsed = JSON.parse(stored) as Partial<PrototypeState>
    return mergeState(defaultState, {
      stage: parsed.stage,
      prefilledDocuments: parsed.prefilledDocuments,
      modules: parsed.modules,
      data: parsed.data,
    })
  } catch {
    return mergeState(defaultState)
  }
}

const state = reactive<PrototypeState>(readInitialState())

function syncStorage(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.set(URL_STAGE_KEY, state.stage)
  url.searchParams.set(
    URL_MODULES_KEY,
    [state.modules.partners ? 'partners' : '', state.modules.transactions ? 'transactions' : '']
      .filter(Boolean)
      .join(','),
  )
  url.searchParams.set(URL_DOCUMENTS_KEY, state.prefilledDocuments ? 'prefilled' : 'stage')
  window.history.replaceState(null, '', url)
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      stage: state.stage,
      prefilledDocuments: state.prefilledDocuments,
      modules: state.modules,
      data: state.data,
    }),
  )
}

export function usePrototypeState() {
  const scenario = computed(
    () => prototypeScenarios.find((item) => item.id === state.stage) ?? prototypeScenarios[0],
  )

  const healthVariant = computed<HealthVariant>(() => {
    if (state.stage === 'complete') return 'synced'
    if (state.stage === 'personalising') return 'syncing'
    return 'unsync'
  })

  const bannerVariant = computed<BannerVariant>(() => {
    if (state.stage === 'complete') return 'none'
    if (state.stage === 'personalising') return 'compact'
    return 'carousel'
  })

  const showAlert = computed(() => state.stage === 'personalising')

  const showLoanSimulationInMain = computed(() => state.stage === 'default')

  const showLoanSimulationInSidebar = computed(() => state.stage !== 'default')

  const showPartners = computed(() => state.modules.partners)

  const showTransactions = computed(() => state.modules.transactions)

  /** Stage that decides which financing documents are on file. Prefilled acts like a complete profile. */
  const documentStage = computed<PrototypeStage>(() =>
    state.prefilledDocuments ? 'complete' : state.stage,
  )

  function setStage(stage: PrototypeStage): void {
    const target = prototypeScenarios.find((item) => item.id === stage)
    const next = mergeState(defaultState, target?.overrides)
    next.stage = stage
    state.stage = next.stage
    state.modules = next.modules
    state.data = next.data
    syncStorage()
  }

  function toggleModule(module: 'partners' | 'transactions'): void {
    if (module === 'partners') state.modules.partners = !state.modules.partners
    if (module === 'transactions') state.modules.transactions = !state.modules.transactions
    syncStorage()
  }

  function togglePrefilledDocuments(): void {
    state.prefilledDocuments = !state.prefilledDocuments
    syncStorage()
  }

  /** Adds a new application, or replaces a draft with the same id, and marks its invoices submitted. */
  function submitApplication(application: LoanApplication, invoiceIds: string[]): void {
    state.data.applications = [
      application,
      ...state.data.applications.filter((item) => item.id !== application.id),
    ]
    state.data.submittedInvoiceIds = [
      ...new Set([...(state.data.submittedInvoiceIds ?? []), ...invoiceIds]),
    ]
    syncStorage()
  }

  /** Attaches the one invoice to an application that was submitted without it. */
  function attachInvoice(
    applicationId: string,
    invoice: { id: string; invoiceNumber: string; amount: string },
  ): void {
    const number = invoice.invoiceNumber.replace('#', '')
    state.data.applications = state.data.applications.map((item) =>
      item.id === applicationId && item.source
        ? {
            ...item,
            amount: invoice.amount,
            note: `${number} attached`,
            noteTone: 'default',
            details: item.details.map((detail) =>
              detail.label === 'Invoice' ? { ...detail, value: number } : detail,
            ),
            source: { ...item.source, rowId: invoice.id },
          }
        : item,
    )
    state.data.submittedInvoiceIds = [...new Set([...(state.data.submittedInvoiceIds ?? []), invoice.id])]
    syncStorage()
  }

  return {
    state,
    scenario,
    healthVariant,
    bannerVariant,
    showAlert,
    showPartners,
    showTransactions,
    documentStage,
    showLoanSimulationInMain,
    showLoanSimulationInSidebar,
    setStage,
    toggleModule,
    togglePrefilledDocuments,
    submitApplication,
    attachInvoice,
  }
}
