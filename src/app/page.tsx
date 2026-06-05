"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, X } from "lucide-react"

import {
  getActiveBranches,
  getActiveCategories,
  getDepartmentsByCategory,
  getDesignationsByDepartment,
  getActiveContractTypes,
  submitEmployeeData,
  checkIsAdmin
} from "@/lib/actions"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  branch_id: z.coerce.number().min(1, "Please select a branch."),
  epf_no: z.string().regex(/^\d+$/, "EPF Number must contain only numbers."),
  first_name: z.string().regex(/^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/, "First Name must be Title Case (e.g., Nimal). Initials/single letters are not allowed."),
  middle_name: z.string().optional().refine(val => !val || /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(val), "Middle Name must be Title Case. Initials/single letters are not allowed."),
  last_name: z.string().regex(/^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/, "Last Name must be Title Case. Initials/single letters are not allowed."),
  join_date: z.string().min(1, "Date of Joining is required."),
  category_id: z.coerce.number().min(1, "Please select a category."),
  department_id: z.coerce.number().min(1, "Please select a department."),
  designation_id: z.coerce.number().min(1, "Please select a designation."),
  contract_type_name: z.string({ message: "Please select a contract type." }).min(1),
  nic: z.string().regex(/^(?:\d{9}[vVxX]|\d{12})$/, "Invalid Sri Lankan NIC format."),
  mobile: z.string().regex(/^(?:\+94|94|0)?7\d{8}$/, "Invalid Sri Lankan mobile number format."),
  gender: z.enum(["Male", "Female"], { message: "Please select a gender." })
})

export default function PublicForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showWarning, setShowWarning] = useState(true)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function init() {
      const adminStatus = await checkIsAdmin()
      setIsAdmin(adminStatus)
      if (!adminStatus) {
        const deadline = new Date('2026-06-06T00:00:00+05:30')
        if (new Date() > deadline) {
          setIsDeadlinePassed(true)
        }
      }
    }
    init()
  }, [])

  const [branches, setBranches] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [contractTypes, setContractTypes] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    mode: "onChange",
    defaultValues: {
      epf_no: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      join_date: "",
      nic: "",
      mobile: "",
      contract_type_name: "",
      branch_id: "" as any,
      category_id: "" as any,
      department_id: "" as any,
      designation_id: "" as any,
      gender: "" as any,
    },
  })

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [b, c, ct] = await Promise.all([
          getActiveBranches(),
          getActiveCategories(),
          getActiveContractTypes()
        ])
        setBranches(b || [])
        setCategories(c || [])
        setContractTypes(ct || [])
      } catch (error) {
        toast.error("Failed to load form data. Please refresh.")
      }
    }
    loadInitialData()
  }, [])

  const selectedCategoryId = form.watch("category_id")
  const selectedDepartmentId = form.watch("department_id")

  useEffect(() => {
    if (selectedCategoryId) {
      getDepartmentsByCategory(selectedCategoryId).then(d => {
        setDepartments(d || [])
        form.setValue("department_id", "" as any)
        form.setValue("designation_id", "" as any)
        setDesignations([])
      })
    }
  }, [selectedCategoryId, form])

  useEffect(() => {
    if (selectedDepartmentId) {
      getDesignationsByDepartment(selectedDepartmentId).then(d => {
        setDesignations(d || [])
        form.setValue("designation_id", "" as any)
      })
    }
  }, [selectedDepartmentId, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Map IDs to Names
    const branch_name = branches.find(b => b.branch_id === values.branch_id)?.branch_name
    const category_name = categories.find(c => c.category_id === values.category_id)?.category_name
    const Department = departments.find(d => d.department_id === values.department_id)?.Department
    const Designation = designations.find(d => d.designation_id === values.designation_id)?.Designation

    const fullData = {
      ...values,
      branch_name,
      category_name,
      Department,
      Designation
    }

    try {
      const res = await submitEmployeeData(fullData)
      if (res.success) {
        setIsSuccess(true)
        window.scrollTo(0, 0)
      } else {
        toast.error(res.error || "Failed to submit.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Thank you</CardTitle>
            <CardDescription>Your employee details have been successfully submitted.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => {
              form.reset()
              setIsSuccess(false)
            }}>
              Submit Another Response
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isDeadlinePassed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Deadline Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-lg leading-relaxed">
              This System will no longer accept Data from Employees of Leeds International School, as the given deadline period is Over.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 py-8 md:py-12 flex flex-col items-center justify-center relative">
      {showWarning && !isDeadlinePassed && !isAdmin && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-destructive text-destructive-foreground p-4 rounded-xl shadow-xl flex items-start justify-between animate-in slide-in-from-top-4">
          <p className="text-sm font-medium mr-4">
            This system will not accept data from midnight today (05 June 2026).
          </p>
          <button 
            onClick={() => setShowWarning(false)} 
            className="text-destructive-foreground/80 hover:text-white mt-0.5 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Leeds International School</h1>
          <h2 className="text-lg md:text-xl text-primary font-medium">Employee Data Collection for Athena School Management System</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-2xl mx-auto">
            Please complete this form accurately. The information collected will be used for the Athena School Management System employee data migration.
          </p>
        </div>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Branch">
                                {field.value ? branches.find(b => b.branch_id.toString() === field.value.toString())?.branch_name : "Select Branch"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches.map(b => (
                              <SelectItem key={b.branch_id} value={b.branch_id.toString()}>
                                {b.branch_name}
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
                    name="epf_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EPF Number <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter EPF Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Middle Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="join_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Joining <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIC Number <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="123456789V or 200012345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="0771234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender">
                                {field.value ? field.value : "Select Gender"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category">
                                {field.value ? categories.find(c => c.category_id.toString() === field.value.toString())?.category_name : "Select Category"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(c => (
                              <SelectItem key={c.category_id} value={c.category_id.toString()}>
                                {c.category_name}
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
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""} disabled={!selectedCategoryId || departments.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Department">
                                {field.value ? departments.find(d => d.department_id.toString() === field.value.toString())?.Department : "Select Department"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map(d => (
                              <SelectItem key={d.department_id} value={d.department_id.toString()}>
                                {d.Department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCategoryId && departments.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">No active departments available.</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designation_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""} disabled={!selectedDepartmentId || designations.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Designation">
                                {field.value ? designations.find(d => d.designation_id.toString() === field.value.toString())?.Designation : "Select Designation"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {designations.map(d => (
                              <SelectItem key={d.designation_id} value={d.designation_id.toString()}>
                                {d.Designation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedDepartmentId && designations.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">No active designation is available under this department. Please contact the admin.</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contract_type_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Type <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Contract Type">
                                {field.value ? field.value : "Select Contract Type"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contractTypes.map(c => (
                              <SelectItem key={c.contract_type_name} value={c.contract_type_name}>
                                {c.contract_type_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-8 flex justify-end">
                  <Button type="submit" size="lg" className="w-full md:w-auto min-w-[240px]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Employee Details"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
