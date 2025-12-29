"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. Define Security-Focused Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid university email."),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters per security policy."),
  otp: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2. Initialize Hook Form
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      otp: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        otp: values.otp || undefined,
      });

      if (!res) {
        toast.error("Security Engine Offline.");
      } else if (res.error === "ACCOUNT_LOCKED") {
        toast.error("Access Denied", {
          description:
            "Account locked for 15 minutes due to failed login attempts.",
        });
      } else if (res.error === "INVALID_CREDENTIALS") {
        toast.error("Authentication Failed", {
          description: "Invalid email or password.",
        });
      } else if (res.error === "MFA_REQUIRED") {
        setShowOTP(true);
        toast("MFA Challenge Issued", {
          description: "Enter the code from your authenticator app.",
        });
      } else if (res.error) {
        toast.error("Unexpected Error", { description: res.error });
      } else {
        toast.success("Identity Verified", { description: "Redirecting..." });
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      toast.error("System Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4">
      {/* Visual Identity / Security Level */}
      <div className="mb-6 flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase tracking-tighter">
        <ShieldCheck className="w-3 h-3" />
        LMS Protocol: Secure Session / Token-Based Auth
      </div>

      <Card className="w-full max-w-[400px] shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter credentials to access protected LMS resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="name@university.edu"
                          className="pl-10"
                          {...field}
                          disabled={showOTP || loading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="pl-10"
                          {...field}
                          disabled={showOTP || loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic OTP Field */}
              {showOTP && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <FormLabel className="text-blue-600">
                        6-Digit Security Code
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                          <Input
                            placeholder="000000"
                            className="pl-10 border-blue-200"
                            {...field}
                            autoFocus
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : showOTP ? (
                  "Verify MFA"
                ) : (
                  "Secure Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="flex justify-between w-full text-xs">
            <Link href="/register" className="text-primary hover:underline">
              New User?
            </Link>
            <Link
              href="/forgot"
              className="text-muted-foreground hover:text-primary"
            >
              Recovery
            </Link>
          </div>

          {/* Security Compliance Info */}
          <div className="w-full bg-slate-100 p-3 rounded-md text-[10px] text-slate-500 border border-slate-200">
            <div className="flex gap-2">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold uppercase">
                  Security Compliance Notice:
                </p>
                <p>
                  MAC clearance and Department attributes are evaluated upon
                  login. 5 unsuccessful attempts trigger a temporary account
                  lockout.
                </p>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
