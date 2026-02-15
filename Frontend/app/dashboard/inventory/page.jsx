'use client'

import dynamic from 'next/dynamic'

const InventoryManagement = dynamic(() => import('@/components/modules/InventoryManagement/inventory-management'), {
  loading: () => <div>Loading...</div>
})

export default function InventoryPage() {
  return <InventoryManagement />
}
