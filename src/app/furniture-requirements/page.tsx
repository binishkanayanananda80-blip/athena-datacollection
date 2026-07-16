"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getAvailableBranchesForRegistration, registerBranchUser, loginBranchUser } from "@/lib/furniture-actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z.object({
  branch_id: z.coerce.number().min(1, "Please select a branch."),
  full_name: z.string().min(2, "Full Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dots, hyphens and underscores allowed"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirm_password: z.string(),
  agreement: z.boolean().refine(val => val === true, "You must confirm authorization to register.")
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const loginSchema = z.object({
  identifier: z.string().min(1, "Username or Email is required"),
  password: z.string().min(1, "Password is required"),
});

export default function FurnitureAuthPage() {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Furniture Requirement
          </h1>
          <p className="text-sm text-slate-500">
            Register as the authorised representative of your branch to submit furniture requirements.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "register" ? "bg-white shadow-sm text-primary" : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Create Branch Account
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "login" ? "bg-white shadow-sm text-primary" : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            {activeTab === "register" ? <RegistrationForm /> : <LoginForm />}
          </CardContent>
        </Card>

        {activeTab === "register" && (
          <div className="text-center text-xs text-slate-500">
            Only one authorised user can register for each branch. Your registration will be reviewed by the system administrator.
          </div>
        )}
      </div>
    </div>
  );
}

function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      branch_id: 0,
      full_name: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      confirm_password: "",
      agreement: false,
    },
  });

  useEffect(() => {
    async function loadBranches() {
      try {
        const b = await getAvailableBranchesForRegistration();
        setBranches(b);
      } catch (error) {
        toast.error("Failed to load branches.");
      }
    }
    loadBranches();
  }, []);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsSubmitting(true);
    try {
      const res = await registerBranchUser(values);
      if (res.success) {
        setIsSuccess(true);
      } else {
        toast.error(res.error || "Registration failed.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900">Registration Submitted</h3>
        <p className="text-sm text-slate-500">
          Your registration has been submitted and is awaiting administrator approval. You will be able to log in once approved.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="branch_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.branch_id} value={b.branch_id.toString()} disabled={!b.isAvailable}>
                      {b.branch_name} {!b.isAvailable && "(Already Registered)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><Input placeholder="johndoe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number (Optional)</FormLabel>
              <FormControl><Input placeholder="07xxxxxx" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl><Input type="password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  I confirm that I am authorised to submit furniture requirement data for the selected branch.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        {form.formState.errors.agreement && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.agreement.message}</p>
        )}

        <Button type="submit" className="w-full bg-[#232c5e] hover:bg-[#1a2147]" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Registration
        </Button>
      </form>
    </Form>
  );
}

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      const res = await loginBranchUser(values);
      if (res.success) {
        toast.success("Login successful");
        router.push("/furniture-requirements/dashboard");
      } else {
        toast.error(res.error || "Login failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username or Email</FormLabel>
              <FormControl><Input placeholder="Username or Email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
        </div>

        <Button type="submit" className="w-full bg-[#232c5e] hover:bg-[#1a2147]" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Login
        </Button>
      </form>
    </Form>
  );
}
