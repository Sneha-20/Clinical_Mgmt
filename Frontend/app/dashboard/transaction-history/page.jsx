"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import TransactionForm from '@/components/modules/receptionist/component/TransactionForm';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/lib/services/transactions';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from 'react-hot-toast';
import Backbutton from '@/components/ui/Backbutton';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const { execute: fetchTransactions, loading } = useApi();

  const loadTransactions = async () => {
    try {
      const params = {};
      if (filterType && filterType !== 'All') params.transaction_type = filterType;
      const result = await fetchTransactions(() => getTransactions(params));
      setTransactions(result.transactions);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filterType]);

  const handleAdd = async (data) => {
    try {
      await createTransaction(data);
      toast.success('Transaction added successfully');
      loadTransactions();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateTransaction(editingTransaction.id, data);
      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
      loadTransactions();
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted successfully');
      loadTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Backbutton />
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
            Transaction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            View and manage all transactions.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex h-9 w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <option value="All">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <Button onClick={openAddModal}>Add Transaction</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Person Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No transactions found</TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.transaction_type}</TableCell>
                <TableCell>{transaction.person_name}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className={transaction.transaction_type === 'Expense' ? 'text-red-500' : 'text-green-500'}>{transaction.amount}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(transaction)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(transaction.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
         
            <div className='flex justify-end mt-4 w-full'>
                <div>
                {(filterType === 'Income' || filterType === 'All') && <p>  Total Income {transactions.reduce((sum, t) => sum + Number(t.amount) , 0)} </p>}
                {(filterType === 'Expense' || filterType === 'All') && (<p>
                Total Expense {transactions.reduce((sum, t) => sum + Number(t.amount) , 0)}
                </p>)}
                </div>
            </div>
          
        </TableBody>
      </Table>

      <TransactionForm
        isModalOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingTransaction ? handleEdit : handleAdd}
        initialData={editingTransaction}
      />
    </div>
  );
}