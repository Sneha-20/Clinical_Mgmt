import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CommonRadio from '@/components/ui/CommonRadio';
import Modal from '@/components/ui/Modal'
import { Formik, Form, Field } from 'formik';
import { transactionSchema } from '@/lib/utils/schema';
import React from 'react'

const initialValues = {
  transaction_type: '',
  person_name: '',
  category: '',
  amount: '',
};

export default function TransactionForm({ isModalOpen, onClose, onSubmit = () => {}, initialData = null }) {
  const expenseTypeOptions = [
    { value: 'Expense', label: 'Expense' },
    { value: 'Income', label: 'Income' },
  ];

  const getInitialValues = () => {
    if (initialData) {
      return {
        transaction_type: initialData.transaction_type || '',
        person_name: initialData.person_name || '',
        category: initialData.category || '',
        amount: initialData.amount || '',
      };
    }
    return initialValues;
  };

  const handleSubmit = (values) => {
    console.log("Transaction form submitted", values);
     onSubmit(values);
    onClose();
  };

  return (
    <div>
      <Modal header={initialData ? "Edit Transaction" : "Add Transaction"} isModalOpen={isModalOpen} onClose={onClose} showButton={false} ClassName="">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={transactionSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Transaction Type</label>
                <div className='flex gap-2'>
                {expenseTypeOptions.map((option) => (
                  <CommonRadio
                    key={option.value}
                    label={option.label}
                    name="transaction_type"
                    checked={values.transaction_type === option.value}
                    value={option.value}
                    onChange={(e) => setFieldValue('transaction_type', e.target.value)}
                  />
                ))}
                </div>
                {errors.transaction_type && touched.transaction_type && (
                  <p className="text-xs text-red-500 mt-1">{errors.transaction_type}</p>
                )}
              </div>

              <Field name="person_name">
                {({ field }) => (
                  <Input
                    {...field}
                    label="Person Name"
                    important
                    error={touched.person_name && errors.person_name}
                  />
                )}
              </Field>

              <Field name="category">
                {({ field }) => (
                  <Input
                    {...field}
                    label="Description"
                    important
                    error={touched.category && errors.category}
                  />
                )}
              </Field>

              <Field name="amount">
                {({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Amount"
                    important
                    error={touched.amount && errors.amount}
                  />
                )}
              </Field>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">{initialData ? "Update" : "Add"} Transaction</Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
