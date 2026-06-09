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
  submitStudentData
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
  admission_no: z.string().min(1, "Admission Number is required."),
  first_name: z.string().min(1, "First Name is required."),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last Name is required."),
  gender: z.enum(["Male", "Female"], { message: "Please select a gender." }),
  dob: z.string().min(1, "Date of Birth is required."),
  date_of_admission: z.string().min(1, "Date of Admission is required."),
  student_type: z.string().min(1, "Student Type is required."),
  curriculum_name: z.string().min(1, "Please select a curriculum."),
  academic_year: z.string().min(1, "Academic Year is required."),
  enrolled_academic_year: z.string().min(1, "Enrolled Academic Year is required."),
  grade: z.string().min(1, "Grade is required."),
  class: z.string().min(1, "Class is required."),
  medium: z.string().min(1, "Medium is required."),
  nationality: z.string().min(1, "Nationality is required."),
  religion: z.string().min(1, "Religion is required."),
  emergency_contact: z.string().min(1, "Emergency Contact is required."),
  student_lives_with: z.string().min(1, "Please specify who the student lives with."),
  guardian_type: z.string().min(1, "Guardian Type is required."),
  marital_status: z.string().min(1, "Parent Marital Status is required."),
  is_living: z.string().min(1, "Is Living is required.")
})

export default function StudentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [branches, setBranches] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    mode: "onChange",
    defaultValues: {
      admission_no: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      dob: "",
      date_of_admission: "",
      class: "",
      branch_id: "" as any,
      curriculum_name: "",
      gender: "" as any,
      student_type: "Local",
      academic_year: "2024/2025",
      enrolled_academic_year: "2024/2025",
      grade: "" as any,
      medium: "English",
      nationality: "Sri Lankan",
      religion: "" as any,
      emergency_contact: "" as any,
      student_lives_with: "" as any,
      guardian_type: "" as any,
      marital_status: "" as any,
      is_living: "yes"
    },
  })

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [b] = await Promise.all([
          getActiveBranches()
        ])
        setBranches(b || [])
      } catch (error) {
        toast.error("Failed to load form data. Please refresh.")
      }
    }
    loadInitialData()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Auto calculate age roughly based on current year and DOB year
    const dobDate = new Date(values.dob)
    const age = new Date().getFullYear() - dobDate.getFullYear()

    const branch_name = branches.find(b => b.branch_id === values.branch_id)?.branch_name

    const fullData = {
      ...values,
      age,
      branch_name,
      category_master_id: null
    }

    try {
      const res = await submitStudentData(fullData)
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
            <CardDescription>The student details have been successfully submitted.</CardDescription>
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
    <div className="min-h-screen bg-background p-4 py-8 md:py-12 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Student Data Entry</h1>
          <h2 className="text-lg md:text-xl text-primary font-medium">Athena School Management System</h2>
        </div>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <h3 className="text-xl font-semibold mb-4 text-primary">1. Basic Information</h3>
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
                    name="admission_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Number <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Admission No" {...field} />
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                              <SelectValue placeholder="Select Gender" />
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

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Nationality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sri Lankan">Sri Lankan</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religion <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Religion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Buddhist">Buddhist</SelectItem>
                            <SelectItem value="Cristian">Cristian</SelectItem>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Hindu">Hindu</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="student_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Type <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Local">Local</SelectItem>
                            <SelectItem value="International">International</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4 text-primary">2. Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date_of_admission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Admission <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="curriculum_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Curriculum <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Curriculum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Edexcel">Edexcel</SelectItem>
                            <SelectItem value="Local">Local</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="academic_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2023/2024">2023/2024</SelectItem>
                            <SelectItem value="2024/2025">2024/2025</SelectItem>
                            <SelectItem value="2025/2026">2025/2026</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enrolled_academic_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrolled Academic Year <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Enrolled Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2023/2024">2023/2024</SelectItem>
                            <SelectItem value="2024/2025">2024/2025</SelectItem>
                            <SelectItem value="2025/2026">2025/2026</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Play Group">Play Group</SelectItem>
                            <SelectItem value="Kindergarten 1">Kindergarten 1</SelectItem>
                            <SelectItem value="Kindergarten 2">Kindergarten 2</SelectItem>
                            <SelectItem value="Primary 01">Primary 01</SelectItem>
                            <SelectItem value="Primary 02">Primary 02</SelectItem>
                            <SelectItem value="Primary 03">Primary 03</SelectItem>
                            <SelectItem value="Primary 04">Primary 04</SelectItem>
                            <SelectItem value="Primary 05">Primary 05</SelectItem>
                            <SelectItem value="Form 01">Form 01</SelectItem>
                            <SelectItem value="Form 02">Form 02</SelectItem>
                            <SelectItem value="Form 03">Form 03</SelectItem>
                            <SelectItem value="Form 04">Form 04</SelectItem>
                            <SelectItem value="Form 05">Form 05</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 10-A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medium <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Medium" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Sinhala">Sinhala</SelectItem>
                            <SelectItem value="Tamil">Tamil</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4 text-primary">3. Parent / Guardian Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="guardian_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Type <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Guardian Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="student_lives_with"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Lives With <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Guardian" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Marital Status <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MARRIED">Married</SelectItem>
                            <SelectItem value="UNMARRIED">Unmarried</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_living"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parents are Living? <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Yes/No" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
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
                      "Submit Student Details"
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
