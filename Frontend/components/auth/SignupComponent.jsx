"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

import { staticText } from "@/lib/utils/constants/staticOption";
import { registerSchema } from "@/lib/utils/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DropDown from "../ui/dropdown";
import { showToast } from "../ui/toast";

import { register } from "@/lib/services/auth";
import { startLoading, stopLoading } from "@/lib/redux/slice/uiSlice";
import RoleSelection from "../ui/RoleSelection";
import { extractYupErrors } from "@/lib/utils/helper/extractError";
import { routes } from "@/lib/utils/constants/route";
import { useRouter } from "next/navigation";
import CommonCheckbox from "../ui/CommonCheckbox";

export default function SignupComponent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleSignup = (role) => {
    localStorage.setItem("userRole", role);
  };
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    clinic_id: [],
    role_id: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -------------------------------
  // Clinic Options Memoized
  // -------------------------------
  const clinicOptions = useMemo(
    () =>
      staticText.clinicOption.map(({ id, label }) => ({
        label,
        value: id,
      })),
    [],
  );

  // -------------------------------
  // Generic Input Handler
  // -------------------------------
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  // -------------------------------
  // Dropdown / Role Handler
  // -------------------------------
  const updateField = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  // Keep clinic selection shape consistent: always store as array in state.
  const handleClinicDropdown = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, clinic_id: value ? [value] : [] }));
      if (errors.clinic_id) setErrors((prev) => ({ ...prev, clinic_id: "" }));
    },
    [errors],
  );

  const handleClinicCheckbox = useCallback(
    (value) => {
      const parsed = Number(value);
      setFormData((prev) => {
        const exists = prev.clinic_id.includes(parsed);
        return {
          ...prev,
          clinic_id: exists
            ? prev.clinic_id.filter((c) => c !== parsed)
            : [...prev.clinic_id, parsed],
        };
      });
      if (errors.clinic_id) setErrors((prev) => ({ ...prev, clinic_id: "" }));
    },
    [errors],
  );

  // Reset/shape clinic selection when role changes
  useEffect(() => {
    const managerRoleId =
      (staticText.roleOption.find((r) => r.key === "manager") || {}).id;
    const isManager = Number(formData.role_id) === Number(managerRoleId);
    if (!isManager) {
      // ensure single-select mode: keep only first selection (or empty)
      setFormData((prev) => ({ ...prev, clinic_id: prev.clinic_id.slice(0, 1) }));
    }
  }, [formData.role_id]);

  // -------------------------------
  // Submit Handler
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(startLoading());
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
      const payload = {
        clinic_id: formData.clinic_id,
        role_id: formData.role_id,
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };
      const res = await register(payload);
      console.log("Registration response:", res);
      showToast({
        type: "success",
        message: res?.message || "Account created successfully!",
      });
      router.push(routes.pages.login);
      handleSignup(formData.role_id);
    } catch (error) {
      console.log("Error during registration:", error);
      if (error.name === "ValidationError") {
        setErrors(extractYupErrors(error));
      } else {
        showToast({
          type: "error",
          message: error?.response?.data?.error || "Something went wrong",
        });
      }
    } finally {
      dispatch(stopLoading());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="w-full max-w-2xl">
        <div
          className="mb-6 text-center"
          onClick={() => router.push(routes.pages.home)}
        >
          <h1 className="text-3xl font-bold text-primary">NOIS</h1>
          <p className="text-xs text-muted-foreground">
            Navjeevan Operating Intelligence System
          </p>
        </div>
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Join NOIS to manage your clinic</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name + Phone */}
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  placeholder="Dr. John Doe"
                  onChange={handleChange}
                  error={errors.fullName}
                />

                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  placeholder="+91 9876543210"
                  onChange={handleChange}
                  error={errors.phone}
                />
              </div>

              {/* Email */}
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                placeholder="your@clinic.com"
                onChange={handleChange}
                error={errors.email}
              />

              {/* Password + Confirm */}
              <div className="grid sm:grid-cols-2 gap-5">
                <PasswordField
                  label="Password"
                  name="password"
                  value={formData.password}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onChange={handleChange}
                  error={errors.password}
                />

                <PasswordField
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  error={errors.confirmPassword}
                />
              </div>

              {/* Role Options */}
              <RoleSelection
                options={staticText.roleOption}
                selected={formData.role_id}
                onSelect={(id) => updateField("role_id", id)}
                error={errors.role_id}
              />
              {/* Clinic selection: multiple checkboxes for manager, single dropdown otherwise */}
              {(() => {
                const managerRoleId =
                  (staticText.roleOption.find((r) => r.key === "manager") || {}).id;
                const isManager = Number(formData.role_id) === Number(managerRoleId);

                if (isManager) {
                  return (
                    <div className="grid grid-cols-1 gap-2">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Clinic(s)
                      </label>
                      {clinicOptions.map((clinic) => (
                        <CommonCheckbox
                          key={clinic.value}
                          label={clinic.label}
                          value={clinic.value}
                          checked={formData.clinic_id.includes(clinic.value)}
                          onChange={(e) => handleClinicCheckbox(e.target.value)}
                        />
                      ))}
                      {errors.clinic_id && (
                        <p className="text-xs text-destructive mt-1">{errors.clinic_id}</p>
                      )}
                    </div>
                  );
                }

                return (
                  <DropDown
                    label="Clinic Name"
                    name="clinic_id"
                    options={clinicOptions}
                    value={formData.clinic_id[0] || null}
                    onChange={handleClinicDropdown}
                    placeholder="Select clinic"
                    error={errors.clinic_id}
                  />
                );
              })()}

              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center border-t pt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(routes.pages.login)}
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------------
   Reusable Sub Components
---------------------------------- */

function PasswordField({
  label,
  showPassword,
  setShowPassword,
  error,
  ...props
}) {
  return (
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
  );
}
