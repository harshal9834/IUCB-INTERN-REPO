import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/auth-context";
import { axiosInstance, setAccessToken } from "../services/api/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Eye, EyeOff, ShieldAlert, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/admin/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { accessToken, admin } = response.data.data;

      // Save Access Token in memory
      setAccessToken(accessToken);

      // Map API admin shape → User context shape (fullName → name)
      login(accessToken, {
        id: admin.id,
        name: admin.fullName,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      });

      // Redirect to main dashboard page
      navigate({ to: "/admin/dashboard" });
    } catch (error: any) {
      let msg = "Something went wrong. Please try again.";
      if (error.response) {
        if (error.response.status === 404) {
          msg = `API endpoint not found (404) at ${error.config?.url || "/api"}. Please verify server routes.`;
        } else if (error.response.status === 401) {
          msg = error.response.data?.message || "Invalid credentials.";
        } else if (error.response.status === 403) {
          msg = "Access Denied (403). Unauthorized role.";
        } else if (error.response.status >= 500) {
          msg = "Internal Server Error (500). Please try again later.";
        } else {
          msg = error.response.data?.message || msg;
        }
      } else if (error.request) {
        msg = "No response from server. Please verify backend is running on port 5000.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F2942]">
              <Lock className="h-6 w-6 text-[#D4AF37]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0F2942]">
            IUCB Admin Portal
          </CardTitle>
          <CardDescription className="text-slate-500">
            Sign in to access your administrative dashboard
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@iucb.org"
                  className="pl-10 border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                  disabled={isLoading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <a
                  href="/admin/forgot-password"
                  className="text-xs font-semibold text-[#0F2942] hover:text-[#D4AF37] transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" {...register("rememberMe")} />
              <Label htmlFor="rememberMe" className="text-sm text-slate-600 font-normal">
                Remember me on this device
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-[#0F2942] text-white hover:bg-[#1a446c] focus:ring-[#0F2942] transition-all font-semibold py-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-xs text-slate-400">
              Authorized personnel only. Sessions are audited.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
