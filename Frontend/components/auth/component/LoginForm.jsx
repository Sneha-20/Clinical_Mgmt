"use client";
import React from "react";
import { useCallback, useMemo, useState } from "react";
// import { showToast } from "../ui/toast";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/lib/redux/slice/uiSlice";
import { loginSchema } from "@/lib/utils/schema";
import { extractYupErrors } from "@/lib/utils/helper/extractError";
import { login } from "@/lib/services/auth";
import { staticText } from "@/lib/utils/constants/staticText";
import { Button } from "@/components/ui/button";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";

export default function LoginForm({ onLogin }) {
     const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    clinicId: null,
  });

  const [error, setError] = useState({});
  
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
      const { name, value } = e.target;
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (error[name]) {
        setError((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [error]
  );
    const updateField = useCallback(
    (name,value) => {
      setUserData((prev) => ({ ...prev, [name]: value }));
      if (error[name]) {
        setError((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [error]
  );
    const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginSchema.validate(userData, { abortEarly: false });
      setError({});
      dispatch(startLoading());
      const payload = {
        email: userData.email,
        password: userData.password,
        clinic_id: userData.clinicId,
      };
      const res = await login(payload);
      const role = res?.data?.user?.role?.name
      console.log("Login response:", res?.data?.user?.role?.name);
      onLogin(role);
      showToast({
        type: "success",
        message: res?.message || "Account created successfully!",
      });
    } catch (error) {
      console.log("Login error:", error);
      if (error.name === "ValidationError") {
        setError(extractYupErrors(error));
      } else {
        console.log("Login error:", error);
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
        <DropDown
          label="Clinic Name"
          name="clinicId"
          options={clinicOptions}
          value={userData.clinicId}
          onChange={updateField}
          placeholder="Select clinic"
          error={error.clinicId}
        />

        <Button type="submit" className="w-full" size="lg">
          Sign In
        </Button>
      </form>
    </div>
  );
}
