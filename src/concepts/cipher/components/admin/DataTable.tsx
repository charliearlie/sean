'use client'

import { useState, useMemo } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, adminTypography, adminColors } = cipherTokens

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

export default function DataTable<T>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal)
      const bStr = String(bVal)
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sortKey, sortDir])

  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}` }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: adminTypography.bodyFont,
      }}>
        <thead>
          <tr style={{ background: colors.muted }}>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => (col.sortable !== false) && handleSort(col.key)}
                style={{
                  fontFamily: adminTypography.bodyFont,
                  fontSize: adminTypography.labelSize,
                  letterSpacing: adminTypography.labelLetterSpacing,
                  color: sortKey === col.key ? colors.accent : adminColors.mutedForeground,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderBottom: `1px solid ${colors.border}`,
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  fontWeight: 600,
                }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span style={{ marginLeft: '4px', fontSize: '8px' }}>
                    {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '40px 14px',
                  textAlign: 'center',
                  fontFamily: adminTypography.bodyFont,
                  fontSize: adminTypography.dataSize,
                  color: adminColors.mutedForeground,
                  letterSpacing: '0.1em',
                }}
              >
                NO DATA FOUND
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.1s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = colors.muted
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '12px 14px',
                      fontFamily: adminTypography.bodyFont,
                      fontSize: adminTypography.dataSize,
                      color: colors.cardForeground,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
