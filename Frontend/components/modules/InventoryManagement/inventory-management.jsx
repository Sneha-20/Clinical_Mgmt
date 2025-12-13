'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, AlertTriangle, TrendingDown } from 'lucide-react'

export default function InventoryManagement() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Hearing Aids - Premium',
      category: 'Hearing Aids',
      currentStock: 15,
      minimumStock: 20,
      purchased: 30,
      sold: 15,
      unit: 'units',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      name: 'Domes (Size S)',
      category: 'Accessories',
      currentStock: 8,
      minimumStock: 30,
      purchased: 50,
      sold: 42,
      unit: 'pack',
      lastUpdated: '2024-01-14'
    },
    {
      id: 3,
      name: 'Batteries - 312',
      category: 'Batteries',
      currentStock: 5,
      minimumStock: 50,
      purchased: 100,
      sold: 95,
      unit: 'pack',
      lastUpdated: '2024-01-13'
    },
    {
      id: 4,
      name: 'Receivers',
      category: 'Accessories',
      currentStock: 28,
      minimumStock: 15,
      purchased: 40,
      sold: 12,
      unit: 'units',
      lastUpdated: '2024-01-12'
    },
  ])

  const lowStockItems = inventory.filter(item => item.currentStock < item.minimumStock)
  const criticalItems = inventory.filter(item => item.currentStock === 0)

  const handleAddStock = (id, quantity) => {
    setInventory(inventory.map(item =>
      item.id === id
        ? { ...item, currentStock: item.currentStock + quantity, purchased: item.purchased + quantity }
        : item
    ))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Inventory Management</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track stock levels and manage transactions</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Stock
        </Button>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || criticalItems.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {criticalItems.length > 0 && (
            <Card className="border-l-4 border-l-red-500 border-0 bg-red-50">
              <CardContent className="pt-4 sm:pt-6 flex items-center gap-3">
                <AlertTriangle className="w-5 sm:w-6 h-5 sm:h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-red-900">{criticalItems.length} Critical Items</p>
                  <p className="text-xs text-red-700">Out of stock - order immediately</p>
                </div>
              </CardContent>
            </Card>
          )}
          {lowStockItems.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500 border-0 bg-yellow-50">
              <CardContent className="pt-4 sm:pt-6 flex items-center gap-3">
                <TrendingDown className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-yellow-900">{lowStockItems.length} Low Stock Items</p>
                  <p className="text-xs text-yellow-700">Below minimum threshold</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Inventory Items</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Current stock status and transaction history</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-max sm:min-w-0">
            <thead className="border-b border-border">
              <tr className="text-muted-foreground">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">Item Name</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Current Stock</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Min. Level</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Purchased</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Sold</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Status</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const status = item.currentStock === 0 ? 'critical' : item.currentStock < item.minimumStock ? 'low' : 'good'
                return (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3 font-semibold">{item.currentStock}</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3">{item.minimumStock}</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3 text-accent">{item.purchased}</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3 text-destructive">{item.sold}</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        status === 'good' ? 'bg-green-100 text-green-600' :
                        status === 'low' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {status === 'good' ? 'Good' : status === 'low' ? 'Low' : 'Critical'}
                      </span>
                    </td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-3">
                      <Button variant="outline" size="sm" onClick={() => handleAddStock(item.id, 10)} className="text-xs">
                        Add +10
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-muted-foreground text-xs">Total Items</p>
            <p className="text-2xl font-bold mt-2">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-muted-foreground text-xs">Total Units in Stock</p>
            <p className="text-2xl font-bold mt-2">{inventory.reduce((sum, item) => sum + item.currentStock, 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-muted-foreground text-xs">Total Sold</p>
            <p className="text-2xl font-bold text-accent mt-2">{inventory.reduce((sum, item) => sum + item.sold, 0)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
