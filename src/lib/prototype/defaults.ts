import type { PrototypeState } from './types'

export const defaultState: PrototypeState = {
  stage: 'default',
  modules: {
    partners: false,
    transactions: false,
  },
  data: {
    balance: 0,
    incomingFund: 0,
    applications: [],
    bcaFeed: null,
  },
}
