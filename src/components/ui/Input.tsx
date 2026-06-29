/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>}
      <input
        className={cn(
          'w-full rounded-xl bg-gray-50 border-none px-4 py-2.5 text-sm ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-campus-blue focus:bg-white outline-none placeholder:text-gray-400',
          error && 'ring-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
