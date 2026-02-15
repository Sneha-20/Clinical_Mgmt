import Companylogo from "@/public/icon/clinic-logo.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import LoginForm from "./component/LoginForm";
import { routes } from "@/lib/utils/constants/route";
import { useRouter } from "next/navigation";

export default function LoginComponent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <div
            className="flex items-center justify-center gap-2 mb-3 sm:mb-4"
            onClick={() => router.push(routes.pages.home)}
          >
            <div className=" flex items-center justify-center">
              <Image
                width={24}
                height={24}
                src={Companylogo}
                alt="compony logo"
              />
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
            <LoginForm />
            <div className="border-t pt-4 sm:pt-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Don't have an account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(routes.pages.signup)}
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
