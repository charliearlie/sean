'use client'

import { useState, useMemo, useEffect } from 'react'
import { cipherTokens } from '@/concepts/cipher/tokens'

const { colors, adminTypography, adminColors, adminBorders } = cipherTokens

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
  pageSize?: number
  entityName?: string
  emptyMessage?: string
}

export default function DataTable<T>({
  columns,
  data,
  onRowClick,
  pageSize = 20,
  entityName,
  emptyMessage = 'No results found',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

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

  const totalPages = Math.ceil(sorted.length / pageSize)
  const startIdx = (currentPage - 1) * pageSize
  const paged = sorted.slice(startIdx, startIdx + pageSize)
  const showPagination = sorted.length > pageSize

  return (
    <div>
      {/* Row count */}
      {sorted.length > 0 && (
        <div style={{
          fontFamily: adminTypography.bodyFont,
          fontSize: '10px',
          color: adminColors.mutedForeground,
          marginBottom: '8px',
          letterSpacing: '0.05em',
        }}>
          Showing {startIdx + 1}–{Math.min(startIdx + pageSize, sorted.length)} of {sorted.length}{entityName ? ` ${entityName}` : ''}
        </div>
      )}

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
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '40px 14px',
                    textAlign: 'center',
                    fontFamily: adminTypography.bodyFont,
                    fontSize: adminTypography.dataSize,
                    color: adminColors.mutedForeground,
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={(row as Record<string, unknown>).id as string ?? i}
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

      {/* Pagination */}
      {showPagination && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          gap: '12px',
        }}>
          <span style={{
            fontFamily: adminTypography.bodyFont,
            fontSize: '10px',
            color: adminColors.mutedForeground,
          }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.buttonSize,
                letterSpacing: adminTypography.buttonLetterSpacing,
                textTransform: 'uppercase',
                padding: '6px 12px',
                background: 'transparent',
                color: currentPage === 1 ? adminColors.mutedForeground : colors.foreground,
                border: `1px solid ${colors.border}`,
                borderRadius: adminBorders.radius,
                cursor: currentPage === 1 ? 'default' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, i, arr) => (
                <span key={p} style={{ display: 'flex', gap: '4px' }}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span style={{
                      padding: '6px 4px',
                      fontFamily: adminTypography.bodyFont,
                      fontSize: adminTypography.buttonSize,
                      color: adminColors.mutedForeground,
                    }}>
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentPage(p)}
                    style={{
                      fontFamily: adminTypography.bodyFont,
                      fontSize: adminTypography.buttonSize,
                      padding: '6px 10px',
                      background: p === currentPage ? colors.accent : 'transparent',
                      color: p === currentPage ? colors.accentForeground : adminColors.mutedForeground,
                      border: `1px solid ${p === currentPage ? colors.accent : colors.border}`,
                      borderRadius: adminBorders.radius,
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                fontFamily: adminTypography.bodyFont,
                fontSize: adminTypography.buttonSize,
                letterSpacing: adminTypography.buttonLetterSpacing,
                textTransform: 'uppercase',
                padding: '6px 12px',
                background: 'transparent',
                color: currentPage === totalPages ? adminColors.mutedForeground : colors.foreground,
                border: `1px solid ${colors.border}`,
                borderRadius: adminBorders.radius,
                cursor: currentPage === totalPages ? 'default' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
