import { supabase } from './supabaseClient'

async function buscarUsuarios() {
  const { data, error } = await supabase.from('usuarios').select('*')
  if (error) console.error(error)
  else console.log(data)
}
