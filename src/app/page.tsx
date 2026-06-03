"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import {
  getActiveBranches,
  getActiveCategories,
  getDepartmentsByCategory,
  getDesignationsByDepartment,
  getActiveContractTypes,
  submitEmployeeData
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
  branch_id: z.coerce.number({ required_error: "Please select a branch." }),
  epf_no: z.string().min(1, "EPF Number is required."),
  first_name: z.string().min(1, "First Name is required."),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last Name is required."),
  join_date: z.string().min(1, "Date of Joining is required."),
  category_id: z.coerce.number({ required_error: "Please select a category." }),
  department_id: z.coerce.number({ required_error: "Please select a department." }),
  designation_id: z.coerce.number({ required_error: "Please select a designation." }),
  contract_type_name: z.string({ required_error: "Please select a contract type." }).min(1),
  nic: z.string().regex(/^(?:\d{9}[vVxX]|\d{12})$/, "Invalid Sri Lankan NIC format."),
  mobile: z.string().regex(/^(?:\+94|94|0)?7\d{8}$/, "Invalid Sri Lankan mobile number format."),
  gender: z.enum(["Male", "Female"], { required_error: "Please select a gender." })
})

export default function PublicForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [branches, setBranches] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [contractTypes, setContractTypes] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  return (
    <div className="min-h-screen p-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Leeds International School</h1>
          <h2 className="text-lg md:text-xl text-muted-foreground font-medium">Employee Data Collection for Athena School Management System</h2>
          <p className="text-sm text-muted-foreground mt-4">
            Please complete this form accurately. The information collected will be used for the Athena School Management System employee data migration.
          </p>
        </div>

        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardContent className="pt-6">
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

                <div className="pt-6">
                  <Button type="submit" className="w-full md:w-auto min-w-[200px]" disabled={isSubmitting}>
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
