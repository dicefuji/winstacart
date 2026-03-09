'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { storeCategories } from '@/data/stores'

interface CategoryBarProps {
  selected: string
  onSelect: (id: string) => void
}

export default function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  const allCategories = [{ id: 'all', name: 'All', icon: '🏪', color: '#333' }, ...storeCategories]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl transition-all shrink-0 min-w-[72px]"
        >
          {selected === cat.id && (
            <motion.div
              layoutId="category-bg"
              className="absolute inset-0 bg-green-50 border border-green-200 rounded-2xl"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="text-2xl relative z-10">{cat.icon}</span>
          <span className={`text-xs font-medium relative z-10 ${
            selected === cat.id ? 'text-green-700' : 'text-gray-600'
          }`}>
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  )
}
