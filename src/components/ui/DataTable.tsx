import React from 'react';

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className = '' }: DataTableProps) {
  return (
    <div className={`w-full overflow-x-auto border border-[var(--line)] bg-[var(--surface)] ${className}`}>
      <table className="w-full text-left text-sm border-collapse min-w-[600px]">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`border-b border-[var(--line)] bg-[var(--bg)] text-xs font-body text-[var(--text-dim)] font-medium tracking-wider uppercase ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-[var(--line)] text-[var(--text)] font-body ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = '',
  teamColor,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { teamColor?: string }) {
  return (
    <tr
      className={`group hover:bg-[var(--line)]/30 transition-colors relative ${className}`}
      {...props}
    >
      {teamColor && (
        <td
          className="w-1 p-0 absolute left-0 top-0 bottom-0 pointer-events-none"
          style={{ backgroundColor: teamColor }}
        />
      )}
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className = '',
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-2.5 font-medium whitespace-nowrap ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = '',
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-2.5 whitespace-nowrap text-sm ${className}`} {...props}>
      {children}
    </td>
  );
}
