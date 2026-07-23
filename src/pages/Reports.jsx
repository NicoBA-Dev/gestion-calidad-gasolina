import { useEffect, useState, useCallback } from 'react'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../lib/supabaseClient'
import { FuelReportCard } from '../components/FuelReportCard'
import { VolumeChart } from '../components/VolumeChart'
import { DecoderTable } from '../components/DecoderTable'
import { DateRangePicker } from '../components/DateRangePicker'

const COLOR_DOT = { '00': 'bg-black', '01': 'bg-brand-red', '10': 'bg-slate-500' }

const hoy = () => new Date().toISOString().slice(0, 10)
const haceUnMes = () => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

export default function Reports() {
  const [reporte, setReporte] = useState([])
  const [desde, setDesde] = useState(haceUnMes())
  const [hasta, setHasta] = useState(hoy())

  const cargarReporte = useCallback(async () => {
    const { data, error } = await supabase.rpc('reporte_por_combustible_rango', {
      fecha_inicio: `${desde}T00:00:00`,
      fecha_fin: `${hasta}T23:59:59`,
    })
    if (!error) setReporte(data)
  }, [desde, hasta])

  useEffect(() => {
    cargarReporte()
  }, [cargarReporte])

  const chartData = reporte.map((r) => ({
    nombre: r.combustible_nombre,
    litros: Number(r.total_litros),
    codigo: r.combustible_code,
  }))

  const exportCSV = () => {
    const csv = Papa.unparse(
      reporte.map((r) => ({
        combustible: r.combustible_nombre,
        codigo: r.combustible_code,
        transacciones: r.num_transacciones,
        litros: r.total_litros,
        ingresos: r.total_ingresos,
      }))
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_el_surtidor_${desde}_${hasta}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('El Surtidor Cochabambino - Reporte', 14, 15)
    doc.setFontSize(10)
    doc.text(`Rango: ${desde} a ${hasta}`, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [['Combustible', 'Código', 'Transacciones', 'Litros', 'Ingresos (Bs)']],
      body: reporte.map((r) => [
        r.combustible_nombre,
        r.combustible_code,
        r.num_transacciones,
        Number(r.total_litros).toLocaleString(),
        Number(r.total_ingresos).toLocaleString(),
      ]),
    })
    doc.save(`reporte_el_surtidor_${desde}_${hasta}.pdf`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Reportes Decodificados</h2>
          <p className="text-sm text-gray-500">Motor de análisis y mapeo lógico</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="border border-gray-300 text-sm font-semibold px-4 py-2 rounded-md">
            ⬇ Exportar PDF
          </button>
          <button onClick={exportCSV} className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-md">
            ⬇ Exportar CSV
          </button>
        </div>
      </div>

      <div className="mb-6">
        <DateRangePicker desde={desde} hasta={hasta} onDesde={setDesde} onHasta={setHasta} />
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        <DecoderTable />
        {reporte.map((r) => (
          <FuelReportCard
            key={r.combustible_code}
            nombre={r.combustible_nombre}
            codigo={r.combustible_code}
            ingresos={Number(r.total_ingresos)}
            litros={Number(r.total_litros)}
            color={COLOR_DOT[r.combustible_code] ?? 'bg-gray-400'}
          />
        ))}
        {reporte.length === 0 && (
          <p className="col-span-3 text-sm text-gray-400 flex items-center">Sin ventas en este rango de fechas.</p>
        )}
      </div>

      <VolumeChart data={chartData} />
    </div>
  )
}