'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, AlertTriangle, TrendingDown } from 'lucide-react'
import useInventory from '@/lib/hooks/useInventory'
import AddProductModal from './AddProductModal'
import AddStockModal from './AddStockModal'
import Pagination from '@/components/ui/Pagination'

export default function InventoryManagement() {
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    inventoryItems,
    pagination,
    categories,
    brands,
    models,
    fetchBrands,
    fetchModels,
    createItem,
    addStock,
    fetchInventoryItems,
  } = useInventory()

  const handleAddProduct = async (productData) => {
    setIsSubmitting(true)
    const success = await createItem(productData)
    if (success) {
      setShowAddProductModal(false)
    }
    setIsSubmitting(false)
  }

  const handleAddStockClick = (item) => {
    setSelectedItem(item)
    setShowAddStockModal(true)
  }

  const handleAddStock = async (stockData) => {
    setIsSubmitting(true)
    const success = await addStock(stockData)
    if (success) {
      setShowAddStockModal(false)
      setSelectedItem(null)
    }
    setIsSubmitting(false)
  }

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchInventoryItems(pagination.currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      fetchInventoryItems(pagination.currentPage - 1)
    }
  }

  const lowStockItems = inventoryItems.filter(item => item.quantity_in_stock < 10)
  const criticalItems = inventoryItems.filter(item => item.quantity_in_stock === 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Inventory Management</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track stock levels and manage transactions</p>
        </div>
        <Button onClick={() => setShowAddProductModal(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Product
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
          <CardDescription className="text-xs sm:text-sm">Current stock status and product information</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-3 sm:mx-0">
          {inventoryItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No inventory items found</div>
          ) : (
            <>
              <table className="w-full text-xs sm:text-sm min-w-max sm:min-w-0">
                <thead className="border-b border-border bg-slate-100">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium">Product Name</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium hidden md:table-cell">Category</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium hidden lg:table-cell">Brand</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-3 font-medium hidden lg:table-cell">Model</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Stock</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Stock Type</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium hidden md:table-cell">Unit Price</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Status</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => {
                    const status = item.quantity_in_stock === 0 ? 'critical' : item.quantity_in_stock < 10 ? 'low' : 'good'
                    return (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-2 sm:py-3 px-2 sm:px-3">
                          <div>
                            <p className="font-medium text-xs sm:text-sm">{item.product_name}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="text-left py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">{item.category}</td>
                        <td className="text-left py-2 sm:py-3 px-2 sm:px-3 hidden lg:table-cell">{item.brand}</td>
                        <td className="text-left py-2 sm:py-3 px-2 sm:px-3 hidden lg:table-cell">{item.model_type}</td>
                        <td className="text-center py-2 sm:py-3 px-2 sm:px-3 font-semibold">{item.quantity_in_stock || 0}</td>
                        <td className="text-center py-2 sm:py-3 px-2 sm:px-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                            {item.stock_type}
                          </span>
                        </td>
                        <td className="text-center py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">
                          ₹{parseFloat(item.unit_price || 0).toFixed(2)}
                        </td>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAddStockClick(item)} 
                            className="text-xs"
                          >
                            Add Stock
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    page={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onNext={handleNextPage}
                    onPrev={handlePrevPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-muted-foreground text-xs">Total Items</p>
            <p className="text-2xl font-bold mt-2">{pagination.totalItems || inventoryItems.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-muted-foreground text-xs">Total Units in Stock</p>
            <p className="text-2xl font-bold mt-2">
              {inventoryItems.reduce((sum, item) => sum + (item.quantity_in_stock || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-muted-foreground text-xs">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{lowStockItems.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
        categories={categories}
        brands={brands}
        models={models}
        onCategoryChange={fetchBrands}
        onBrandChange={fetchModels}
        loading={isSubmitting}
      />

      <AddStockModal
        isOpen={showAddStockModal}
        onClose={() => {
          setShowAddStockModal(false)
          setSelectedItem(null)
        }}
        onSubmit={handleAddStock}
        item={selectedItem}
        loading={isSubmitting}
      />
    </div>
  )
}
