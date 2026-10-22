export interface CompanyIdentity {
  name: string
  npwp: string
  npwp15: string
  nitku: string
  address: string
}

/** Dummy company data returned by the NPWP verification step. */
export const verifiedCompany: CompanyIdentity = {
  name: 'PT Maju Sejahtera Indonesia',
  npwp: '8726374837261909',
  npwp15: '8726374837261909',
  nitku: '128739127389123123',
  address:
    'Jl. Tebet Timur no.20, RT 01 RW 12, Tebet, Kampung Melayu, Jakarta Selatan, DKI Jakarta, Indonesia, 19991',
}

export const personalisationCopy = {
  title: 'Personalize your Achilles experience',
  description:
    'Connect your NPWP or NIK to sync tax filings, approve e-Faktur & e-Bupot, get personalized financing offers, risk pulse report and start reconciling transactions.',
  consent:
    'I agree and confirm that I am legally authorized to act on behalf of the company or entity, or on my own behalf where applicable, under Indonesian law, and to accept the Terms & Conditions and Privacy Policy.',
  verifiedAlert: 'NPWP verified. You’re ready to continue.',
} as const

export interface CoretaxCredentials {
  picNpwp: string
  signatoryNpwp: string
  signatoryName: string
  passphrase: string
  authenticationKey: string
}

export function emptyCoretaxCredentials(): CoretaxCredentials {
  return {
    picNpwp: '',
    signatoryNpwp: '',
    signatoryName: '',
    passphrase: '',
    authenticationKey: '',
  }
}
