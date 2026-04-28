/**
 * customerFn.js  –  Customer CRUD via Supabase
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

const AddCustomerFn = async (input) => {
  const { userId, companyId } = await getContext()
  const row = {
    name:       input.name,
    mobile:     input.mobile ?? '',
    email:      input.email ?? '',
    address:    input.address ?? '',
    status:     1,
    company_id: companyId,
    created_by: userId,
  }
  return throwOnError(await supabase.from('customers').insert(row).select().single())
}

const EditCustomerFn = async (input) => {
  const { userId } = await getContext()
  const row = {
    name:        input.name,
    mobile:      input.mobile ?? '',
    email:       input.email ?? '',
    address:     input.address ?? '',
    status:      input.status ?? 1,
    modified_by: userId,
  }
  return throwOnError(
    await supabase.from('customers').update(row).eq('id', input.id).select().single(),
  )
}

const DeleteCustomerFn = async (input) =>
  throwOnError(
    await supabase.from('customers').delete().eq('id', input.id),
  )

export { AddCustomerFn, EditCustomerFn, DeleteCustomerFn }

