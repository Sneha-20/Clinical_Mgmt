"use client";
import React from "react";
import { useCallback, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/lib/redux/slice/uiSlice";
import { loginSchema } from "@/lib/utils/schema";
import { extractYupErrors } from "@/lib/utils/helper/extractError";
import { login } from "@/lib/services/auth";
import { staticText } from "@/lib/utils/constants/staticOption";
import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import CommonCheckbox from "@/components/ui/CommonCheckbox";
import { showToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export default function LoginForm({ onLogin }) {
  const router = useRouter();

  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    clinicId: null,
    isAdmin: false,
  });

  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false); // Ref to prevent multiple calls
  
  const clinicOptions = useMemo(
    () =>
      staticText.clinicOption.map(({ id, label }) => ({
        label,
        value: id,
      })),
    []
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setUserData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        // Clear clinicId when isAdmin is checked
        ...(name === "isAdmin" && checked ? { clinicId: null } : {}),
      }));

      if (error[name]) {
        setError((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
      // Clear clinicId error when isAdmin is checked
      if (name === "isAdmin" && checked && error.clinicId) {
        setError((prev) => ({
          ...prev,
          clinicId: "",
        }));
      }
    },
    [error]
  );

  const updateField = useCallback(
    (name, value) => {
      setUserData((prev) => ({ ...prev, [name]: value }));
      if (error[name]) {
        setError((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [error]
  );

  const handleCheckboxChange = useCallback(
    (e) => {
      const checked = e.target.checked;
      setUserData((prev) => ({
        ...prev,
        isAdmin: checked,
        // Clear clinicId when isAdmin is checked
        ...(checked ? { clinicId: null } : {}),
      }));

      // Clear clinicId error when isAdmin is checked
      if (checked && error.clinicId) {
        setError((prev) => ({
          ...prev,
          clinicId: "",
        }));
      }
    },
    [error]
  );

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmittingRef.current) {
        return;
      }

      try {
        const validationData = userData.isAdmin
          ? { email: userData.email, password: userData.password }
          : userData;
        
        const customSchema = userData.isAdmin
          ? loginSchema.omit(["clinicId"])
          : loginSchema;
        
        await customSchema.validate(validationData, { abortEarly: false });
        setError({});
        
        // Set submitting state
        setIsSubmitting(true);
        isSubmittingRef.current = true;
        dispatch(startLoading());

        const payload = {
          email: userData.email,
          password: userData.password,
          ...(userData.isAdmin ? {} : { clinic_id: userData.clinicId }),
        };

        const res = await login(payload);
        router.push("/dashboard/home");
        showToast({
          type: "success",
          message: res?.message || "Login successful!",
        });
      } catch (error) {
        if (error.name === "ValidationError") {
          setError(extractYupErrors(error));
        } else {
          showToast({
            type: "error",
            message: error?.response?.data?.error || "Something went wrong",
          });
        }
      } finally {
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        dispatch(stopLoading());
      }
    },
    [userData, onLogin, dispatch]
  );
  return (
    <div>
      <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
        <div>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@clinic.com"
            value={userData.email}
            onChange={handleChange}
            className="bg-input text-sm"
            error={error.email}
          />
        </div>
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={userData.password}
            onChange={handleChange}
            className="bg-input text-sm"
            error={error.password}
          />
        </div>
        
        <div>
          <CommonCheckbox
            id="isAdmin"
            label="Is Admin"
            checked={userData.isAdmin}
            onChange={handleCheckboxChange}
            value={userData.isAdmin}
          />
        </div>

        {!userData.isAdmin && (
          <DropDown
            label="Clinic Name"
            name="clinicId"
            options={clinicOptions}
            value={userData.clinicId}
            onChange={updateField}
            placeholder="Select clinic"
            error={error.clinicId}
          />
        )}

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
