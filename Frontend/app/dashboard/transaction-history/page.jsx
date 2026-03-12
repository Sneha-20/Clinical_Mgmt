"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import TransactionForm from '@/components/modules/receptionist/component/TransactionForm';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/lib/services/transactions';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from 'react-hot-toast';
import Backbutton from '@/components/ui/Backbutton';

import CommonDatePicker from '@/components/ui/CommonDatePicker';
import { format } from "date-fns";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [transactionDate, setTransactionDate] = useState(null);
  const { execute: fetchTransactions, loading } = useApi();

  const loadTransactions = async () => {
    try {
      const params = {};
      if (filterType && filterType !== 'All') params.transaction_type = filterType;
      console.log(transactionDate)
      if (transactionDate) params.transaction_date = format(transactionDate, "yyyy-MM-dd");

      const result = await fetchTransactions(() => getTransactions(params));
      setTransactions(result.transactions);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filterType, transactionDate]);

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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between bg-white p-4 rounded-lg border shadow-sm mb-6 mt-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full sm:w-auto">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full sm:w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 shadow-sm transition-all text-slate-700"
            >
              <option value="All">All Transactions</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction Date</label>
            <div className="flex flex-row items-center gap-2">
              <div className="w-full sm:w-48">
                <CommonDatePicker
                  selectedDate={transactionDate}
                  onChange={(date) => setTransactionDate(date)}
                  placeholderText="Select date"
                  className="h-10 w-full"
                />
              </div>
              {transactionDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTransactionDate(null)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 px-3 shrink-0 transition-colors"
                  title="Clear Date"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        <Button onClick={openAddModal} className="h-10 w-full sm:w-auto mt-2 sm:mt-0 shadow-sm font-medium">
          + Add Transaction
        </Button>
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

        </TableBody>
      </Table>

      {!loading && transactions.length > 0 && (
        <div className='flex justify-end mt-4 w-full bg-white p-4 rounded-lg border shadow-sm'>
          <div className="flex gap-6">
            {(filterType === 'Income' || filterType === 'All') && (
              <p className="text-green-600 font-semibold">
                Total Income: ₹{transactions.filter(t => t.transaction_type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0)}
              </p>
            )}
            {(filterType === 'Expense' || filterType === 'All') && (
              <p className="text-red-500 font-semibold">
                Total Expense: ₹{transactions.filter(t => t.transaction_type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0)}
              </p>
            )}
          </div>
        </div>
      )}

      <TransactionForm
        isModalOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingTransaction ? handleEdit : handleAdd}
        initialData={editingTransaction}
      />
    </div>
  );
}