import { computed, reactive } from 'vue'
import { defaultState } from './defaults'
import { prototypeScenarios } from './scenarios'
import type {
  BannerVariant,
  HealthVariant,
  PrototypeStage,
  PrototypeState,
  PrototypeStateOverride,
} from './types'

const STORAGE_KEY = 'ach-prototype-state'
const URL_STAGE_KEY = 'stage'
const URL_MODULES_KEY = 'modules'

function mergeState(base: PrototypeState, override?: PrototypeStateOverride): PrototypeState {
  if (!override) return { ...base }

  const merged: PrototypeState = {
    ...base,
    modules: { ...base.modules },
    data: { ...base.data },
  }

  if (override.stage) merged.stage = override.stage
  if (override.modules) Object.assign(merged.modules, override.modules)
  if (override.data) Object.assign(merged.data, override.data)

  return merged
}

function readInitialState(): PrototypeState {
  if (typeof window === 'undefined') return { ...defaultState }

  const params = new URLSearchParams(window.location.search)
  const stageParam = params.get(URL_STAGE_KEY) as PrototypeStage | null
  const modulesParam = params.get(URL_MODULES_KEY)

  if (stageParam) {
    const scenario = prototypeScenarios.find((item) => item.id === stageParam)
    const state = mergeState(defaultState, scenario?.overrides)
    state.stage = stageParam
    if (modulesParam !== null) {
      const modules = modulesParam.split(',').filter(Boolean)
      state.modules.partners = modules.includes('partners')
      state.modules.transactions = modules.includes('transactions')
    }
    return state
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return { ...defaultState }

  try {
    const parsed = JSON.parse(stored) as Partial<PrototypeState>
    return mergeState(defaultState, {
      stage: parsed.stage,
      modules: parsed.modules,
      data: parsed.data,
    })
  } catch {
    return { ...defaultState }
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
  window.history.replaceState(null, '', url)
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      stage: state.stage,
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

  return {
    state,
    scenario,
    healthVariant,
    bannerVariant,
    showAlert,
    showPartners,
    showTransactions,
    showLoanSimulationInMain,
    showLoanSimulationInSidebar,
    setStage,
    toggleModule,
  }
}
