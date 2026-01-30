import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className = '', ...props }) => (
  <table className={`w-full text-left text-sm ${className}`} {...props} />
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <tbody className={`${className}`} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', ...props }) => (
  <tr className={`border-b last:border-b-0 border-gray-200 dark:border-gray-700 ${className}`} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <th className={`px-4 py-2 font-medium text-gray-600 dark:text-gray-300 ${className}`} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <td className={`px-4 py-2 text-gray-900 dark:text-gray-100 ${className}`} {...props} />
);

export default Table;


