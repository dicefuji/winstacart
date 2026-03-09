'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Store } from '@/lib/types'

interface StoreCardProps {
  store: Store
  index?: number
}

export default function StoreCard({ store, index = 0 }: StoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/store/${store.id}`}>
        <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                style={{ backgroundColor: store.color }}
              >
                {store.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">
                  {store.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{store.deliveryTime}</span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <div className="flex items-center gap-0.5 text-xs text-gray-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{store.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {store.tags.map((tag) => (
                    <Badge key={tag} variant="tag" className="text-[10px] px-2 py-0">
                      {tag === 'No markups' && '$ '}
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
