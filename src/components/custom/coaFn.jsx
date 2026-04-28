/**
 * coaFn.js  –  Chart-of-Accounts CRUD via Supabase
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

const AddCoaFn = async (input) => {
  const { userId, companyId } = await getContext()
  const row = {
    number:     input.number,
    name:       input.name,
    type:       input.type,
    parent:     input.parent ?? '0',
    is_group:   Boolean(input.is_group),
    company_id: companyId,
    created_by: userId,
  }
  return throwOnError(
    await supabase.from('chart_of_accounts').insert(row).select().single(),
  )
}

const EditCoaFn = async (input) => {
  return throwOnError(
    await supabase
      .from('chart_of_accounts')
      .update({
        name:     input.name,
        is_group: Boolean(input.is_group),
        parent:   input.parent ?? '0',
      })
      .eq('id', input.id)
      .select()
      .single(),
  )
}

const DeleteCoaFn = async (input) =>
  throwOnError(
    await supabase.from('chart_of_accounts').delete().eq('id', input.id),
  )

export { AddCoaFn, EditCoaFn, DeleteCoaFn }
