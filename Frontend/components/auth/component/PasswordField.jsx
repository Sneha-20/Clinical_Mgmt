import { Input } from '@/components/ui/input'
import React from 'react'

export default function PasswordField({ label,
  showPassword,
  setShowPassword,
  error,
  ...props}) {
  return (
    <div>
         <div className="relative">
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <Input
                {...props}
                type={showPassword ? "text" : "password"}
                className="bg-input text-sm"
                placeholder="••••••••"
              />
        
              <button
                type="button"
                className="absolute right-2 top-[38px] text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
        
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
    </div>
  )
}
