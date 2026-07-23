export function MetricCard({ label, value, highlight = false }) {
  return (
    <div className={`bg-white border rounded-lg shadow-sm p-5 ${highlight ? 'border-status-critical bg-red-50' : 'border-gray-200'}`}>
      <p className="text-xs font-mono text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-status-critical' : ''}`}>{value}</p>
    </div>
  )
}