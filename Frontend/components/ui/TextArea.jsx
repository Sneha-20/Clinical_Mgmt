import React from "react";

export default function TextArea({
  label,
  name,
  formik,          // optional
  value,           // optional (non-formik)
  onChange,        // optional (non-formik)
  error,
  touched,
  placeholder = "",
  className = "",
  rows = 2,
}) {
  const isFormik = !!formik;

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={
          isFormik
            ? formik.values[name]
            : value
        }
        onChange={
          isFormik
            ? formik.handleChange
            : onChange
        }
        className={`w-full px-3 py-2 border rounded-md ${className}`}
      />

      {/* Error handling */}
      {isFormik && formik.touched[name] && formik.errors[name] && (
        <p className="text-red-500 text-xs">{formik.errors[name]}</p>
      )}

      {!isFormik && touched && error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
}
