export function AuditLogPreview({ surtidorNumero, combustibleCode, litros }) {
  const toBin = (n, len) => Number(n).toString(2).padStart(len, '0')

  return (
    <div className="bg-slate-900 text-green-400 font-mono text-xs rounded-md p-4 space-y-1">
      <p className="text-gray-400">◈ REGISTRO DE AUDITORÍA</p>
      <p>&gt; SOLICITUD_SURTIDOR_{surtidorNumero ?? '--'} : {surtidorNumero ? toBin(surtidorNumero, 8) : '--------'}</p>
      <p>&gt; TIPO_COMBUSTIBLE: {combustibleCode ?? '--'}</p>
      <p>&gt; VOLUMEN: {litros ? Number(litros).toFixed(2) : '0.00'} L</p>
      <p>&gt; HASH_OK</p>
    </div>
  )
}