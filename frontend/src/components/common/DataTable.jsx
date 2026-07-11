import React from 'react';

export default function DataTable({ columns = [], data = [], emptyMessage = 'Không có dữ liệu hiển thị.' }) {
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={col.style}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                <div>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📂</span>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} style={col.style}>
                    {col.render ? col.render(row, rowIdx) : (row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
// 
