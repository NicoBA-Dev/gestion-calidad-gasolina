import { useNavigate } from 'react-router-dom'

export function AlertBell({ count }) {
  const navigate = useNavigate()

  return (
    <button onClick={() => navigate('/alerts')} className="relative text-white/90 hover:text-white">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-status-critical text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}