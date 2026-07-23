const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

export function POSKeypad({ onKeyPress }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((k) => (
        <button
          key={k}
          onClick={() => onKeyPress(k)}
          className={`h-16 rounded-lg text-xl font-semibold ${k === '⌫' ? 'bg-red-50 text-status-critical' : 'bg-gray-100 hover:bg-gray-200'
            }`}
        >
          {k}
        </button>
      ))}
    </div>
  )
}