"use client";

import { use, useCallback, useMemo, useState } from "react";
import Companylogo from "@/public/icon/clinic-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { showToast } from "../ui/toast";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/lib/redux/slice/uiSlice";
import { loginSchema } from "@/lib/utils/schema";
import { extractYupErrors } from "@/lib/utils/helper/extractError";
import { login } from "@/lib/services/auth";
import DropDown from "../ui/dropdown";
import { staticText } from "@/lib/utils/constants/staticText";
import Image from "next/image";

export default function LoginPage({ onLogin, onToggleSignup }) {
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
      onLogin("reception");
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
  // const handleDemoLogin = (role) => {
  //   onLogin(role);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className=" flex items-center justify-center">
              <Image width={24} height={24} src={Companylogo} alt="compony logo"/>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              NOIS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Navjeevan Operating Intelligence System
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm">
              Sign in to your clinic account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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

            <div className="border-t pt-4 sm:pt-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Don't have an account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onToggleSignup}
                className="w-full"
              >
                Create New Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
          Protected system for authorized clinic staff only
        </p>
      </div>
    </div>
  );
}
