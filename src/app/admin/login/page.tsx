"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "./actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function AdminLogin() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    const formData = new FormData(event.currentTarget)
    
    try {
      const result = await login(formData)
      if (result.success) {
        toast.success("Login successful")
        router.push("/admin/dashboard")
      } else {
        toast.error(result.error || "Failed to login")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Admin Login</CardTitle>
          <CardDescription>Leeds International School</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@leeds.lk" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border pt-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to Public Form
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
