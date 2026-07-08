const PATHS = {
  dashboard:  ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  plus:       ['M12 5v14M5 12h14'],
  trash:      ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6'],
  edit:       ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
  download:   ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  upload:     ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  x:          ['M18 6L6 18', 'M6 6l12 12'],
  wallet:     ['M20 12V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-4', 'M18 12h-4a2 2 0 000 4h4'],
  menu:       ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  cloud:      ['M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z'],
  cloudOff:   ['M1 1l22 22', 'M3.67 3.67A10 10 0 002 10a10 10 0 0010 10c1.95 0 3.77-.56 5.3-1.53', 'M6.71 6.71A8 8 0 0117.29 17.3', 'M22.61 16.95A5 5 0 0018 10h-1.26'],
  check:      ['M20 6L9 17l-5-5'],
  chevronDown:['M6 9l6 6 6-6'],
  arrowLeft:  ['M19 12H5', 'M12 19l-7-7 7-7'],
  transfer:   ['M17 3l4 4-4 4', 'M21 7H7', 'M7 21l-4-4 4-4', 'M3 17h14'],
  list:       ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  search:     ['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.35-4.35'],
}

export function Icon({ name, size = 20, className = '', style }) {
  if (name === 'calendar') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    )
  }

  const paths = PATHS[name]
  if (!paths) return null

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}
