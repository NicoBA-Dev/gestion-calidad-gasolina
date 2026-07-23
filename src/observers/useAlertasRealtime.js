import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { adaptSurtidores, adaptAlertas } from '../adapters/supabaseAdapter'

export function useAlertasRealtime() {
  const [surtidores, setSurtidores] = useState([])
  const [alertas, setAlertas] = useState([])

  const fetchSurtidores = useCallback(async () => {
    const { data, error } = await supabase.from('v_surtidores_dashboard').select('*')
    if (!error) setSurtidores(adaptSurtidores(data))
  }, [])

  const fetchAlertas = useCallback(async () => {
    const { data, error } = await supabase.from('v_alertas_activas').select('*')
    if (!error) setAlertas(adaptAlertas(data))
  }, [])

  useEffect(() => {
    fetchSurtidores()
    fetchAlertas()

    const channel = supabase
      .channel('realtime-surtidores-alertas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surtidores' }, () => {
        fetchSurtidores()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas' }, () => {
        fetchAlertas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSurtidores, fetchAlertas])

  return { surtidores, alertas, refetchSurtidores: fetchSurtidores, refetchAlertas: fetchAlertas }
}