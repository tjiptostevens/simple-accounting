/**
 * periodFn.js  –  Period CRUD via Supabase
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

const AddPeriodFn = async (input) => {
  const { userId, companyId } = await getContext()
  const row = {
    name:        input.name,
    description: input.description ?? '',
    start_date:  input.start,
    end_date:    input.end,
    status:      1,
    company_id:  companyId,
    created_by:  userId,
  }
  return throwOnError(await supabase.from('periods').insert(row).select().single())
}

const ClosePeriodFn = async (input) => {
  return throwOnError(
    await supabase
      .from('periods')
      .update({ status: Number(input.status) })
      .eq('id', input.id)
      .select()
      .single(),
  )
}

const DeletePeriodFn = async (input) =>
  throwOnError(
    await supabase.from('periods').delete().eq('id', input.id),
  )

export { AddPeriodFn, ClosePeriodFn, DeletePeriodFn }

