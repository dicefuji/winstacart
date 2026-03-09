'use client'

import React from 'react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CartDrawer from '@/components/layout/CartDrawer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav />
      <CartDrawer />
    </>
  )
}
