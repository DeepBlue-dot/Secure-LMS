"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // SYSTEM DESIGN: API call to the Reset Request route
      const response = await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          captchaToken: "mock-token-from-widget" // Placeholder for Turnstile/ReCaptcha
        }),
      });

      // We handle 200 and 4xx the same visually to prevent user enumeration
      // (Feature 6.b: Preventing Information Leakage)
      setIsSubmitted(true);
      
      toast({
        title: "Request Processed",
        description: "If the account exists, security instructions have been sent.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Could not process request. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Security Portal
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">Account Recovery</CardTitle>
          <CardDescription>
            Enter your email to verify your identity and receive a reset token.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">University Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@university.edu" 
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Requirement 6.b: Bot Prevention Placeholder */}
              <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                  Verification Widget (Cloudflare Turnstile)
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-all shadow-md" 
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Identity...
                  </>
                ) : (
                  "Initiate Recovery"
                )}
              </Button>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <Alert className="bg-slate-50 border-slate-200">
                <AlertDescription className="text-slate-600 leading-relaxed">
                  If <strong>{email}</strong> is associated with a secure profile, 
                  you will receive a password reset link shortly.
                </AlertDescription>
              </Alert>
              <p className="text-xs text-slate-400">
                Check your inbox and spam folder. Link expires in 15 minutes.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Secure Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}