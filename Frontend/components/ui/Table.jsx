export function Table({ children }) {
  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-muted border-b">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }) {
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/50 transition">
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left font-semibold text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  );
}
