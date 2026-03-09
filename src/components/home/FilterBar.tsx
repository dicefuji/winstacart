'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { StoreTag } from '@/lib/types'

const filterOptions: { label: string; value: StoreTag | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '🚗 Pickup', value: 'Pickup' },
  { label: 'EBT', value: 'EBT' },
  { label: '$ No markups', value: 'No markups' },
  { label: '✨ New', value: 'New' },
]

interface FilterBarProps {
  selected: string
  onSelect: (value: string) => void
}

export default function FilterBar({ selected, onSelect }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {filterOptions.map((opt) => (
        <button key={opt.value} onClick={() => onSelect(opt.value)}>
          <Badge
            variant={selected === opt.value ? 'default' : 'tag'}
            className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-all ${
              selected === opt.value
                ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                : ''
            }`}
          >
            {opt.label}
          </Badge>
        </button>
      ))}
    </div>
  )
}
