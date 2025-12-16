import React from 'react'

export default function TextArea({ label, name, formik }) {
  return (
    
        <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        className="w-full px-3 py-2 border rounded-md"
        rows={2}
      />
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-red-500 text-xs">{formik.errors[name]}</p>
      )}
    </div>
  )
}
