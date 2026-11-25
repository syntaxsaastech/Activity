export default function ProgressBar({ label, current, max, unit, color }) {
  // SAFETY CHECK: If current or max is missing, default to 0 or 1 to prevent crashes
  const safeCurrent = Number(current) || 0;
  const safeMax = Number(max) || 1; 
  
  const percentage = Math.min((safeCurrent / safeMax) * 100, 100)
  const isOverLimit = safeCurrent > safeMax

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
        <span><strong>{label}</strong></span>
        <span>{safeCurrent.toFixed(1)} / {safeMax} {unit}</span>
      </div>
      <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: isOverLimit ? '#ff5252' : color, 
          transition: 'width 0.3s ease'
        }} />
      </div>
      {isOverLimit && <div style={{ color: '#ff5252', fontSize: '11px', marginTop: '2px' }}>⚠️ Limit exceeded!</div>}
    </div>
  )
}