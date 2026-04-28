/**
 * assetsFn.js  –  Fixed-assets CRUD via Supabase
 */
import { supabase } from '../../lib/supabase'

const throwOnError = ({ data, error }) => {
  if (error) throw new Error(error.message)
  return data
}

const getContext = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single()
  return { userId, companyId: profile?.company_id }
}

const AddAssetsFn = async (input) => {
  const { userId, companyId } = await getContext()
  const row = {
    name:              input.name,
    code:              input.code ?? '',
    type:              input.type ?? '',
    acquisition_date:  input.acquisition_date ?? null,
    acquisition_value: Number(input.acquisition_value ?? 0),
    useful_life_years: Number(input.useful_life_years ?? 0),
    depreciation_rate: Number(input.depreciation_rate ?? 0),
    current_value:     Number(input.current_value ?? 0),
    company_id:        companyId,
    created_by:        userId,
  }
  return throwOnError(await supabase.from('assets').insert(row).select().single())
}

// Depreciation calculation stays in the React layer for flexibility
const CalcAssetFn = async (_input) => {
  // Placeholder – implement business logic as needed
}

const DeleteAssetsFn = async (input) =>
  throwOnError(
    await supabase.from('assets').delete().eq('id', input.id),
  )

export { AddAssetsFn, CalcAssetFn, DeleteAssetsFn }

