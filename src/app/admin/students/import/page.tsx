"use client"

import { useState, useEffect } from "react"
import { Loader2, Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Papa from "papaparse"

import { getActiveBranches, getActiveCategories, submitBulkStudentData, deleteAllStudentData } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
export default function StudentImportPage() {
  const router = useRouter()
  const [branches, setBranches] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<any[]>([])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [importResult, setImportResult] = useState<{successful: number, failed: number, errors: string[]} | null>(null)
  
  const [isDeletingData, setIsDeletingData] = useState(false)

  const handleDeleteAllData = async () => {
    if (!confirm("Are you absolutely sure you want to delete ALL student data from the database? This cannot be undone.")) return;
    
    setIsDeletingData(true)
    try {
      const res = await deleteAllStudentData()
      if (res.success) {
        toast.success("Successfully deleted all student records.")
        setParsedData([])
        setImportResult(null)
      } else {
        toast.error(res.error || "Failed to delete data")
      }
    } catch (error) {
      toast.error("Error deleting data")
    } finally {
      setIsDeletingData(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      const [b] = await Promise.all([getActiveBranches()])
      setBranches(b || [])
      setCategories([{ category_id: "Edexcel", category_name: "Edexcel" }, { category_id: "Local", category_name: "Local" }])
    }
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setParsedData([])
      setImportResult(null)
    }
  }

  const handleParseLocal = () => {
    if (!file) return toast.error("Please select a file.")
    if (!selectedBranch) return toast.error("Please select a branch.")
    if (!selectedCategory) return toast.error("Please select a curriculum.")

    setIsParsing(true)
    const branch_name = branches.find(b => b.branch_id.toString() === selectedBranch)?.branch_name
    const curriculum_name = categories.find(c => c.category_id.toString() === selectedCategory)?.category_name

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawRows = results.data as any[]
          
          const normalizeStr = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, '')

          const findKey = (row: any, possibleNames: string[]) => {
            const keys = Object.keys(row)
            for (let p of possibleNames) {
              const match = keys.find(k => normalizeStr(k) === normalizeStr(p))
              if (match) return row[match]
            }
            for (let p of possibleNames) {
              const match = keys.find(k => {
                const nk = normalizeStr(k)
                const np = normalizeStr(p)
                if (nk.includes(np)) {
                  // Prevent 'other' from accidentally matching 'mother'
                  if (np.includes('other') && nk.includes('mother')) return false
                  return true
                }
                return false
              })
              if (match) return row[match]
            }
            return ""
          }

          const splitName = (fullName: string | undefined, defaultFName: string | undefined, defaultLName: string | undefined) => {
            let fName = defaultFName || "";
            let mName = "";
            let lName = defaultLName || "";
            if (fullName && !fName && !lName) {
              const parts = fullName.trim().split(/\s+/);
              if (parts.length === 1) {
                fName = parts[0];
              } else {
                lName = parts.pop() || "";
                if (parts.length === 0) {
                  fName = lName;
                  lName = "";
                } else {
                  const isInitial = (token: string) => token.length === 1 || (token.includes('.') && (token.split('.').pop() || "").length <= 1);
                  let firstParts = [];
                  for (let i = 0; i < parts.length; i++) {
                    firstParts.push(parts[i]);
                    if (!isInitial(parts[i])) {
                      break;
                    }
                  }
                  fName = firstParts.join(" ");
                  mName = parts.slice(firstParts.length).join(" ");
                }
              }
            }
            return { fName, mName, lName };
          }

          const parsed = rawRows.map(row => {
             const studentNameParts = splitName(
               findKey(row, ['student name', 'full name', 'name']),
               findKey(row, ['first name', 'fname', 'given name']),
               findKey(row, ['last name', 'lname', 'surname'])
             );
             let fName = studentNameParts.fName;
             let mName = findKey(row, ['middle name', 'mname']) || studentNameParts.mName;
             let lName = studentNameParts.lName;

             const fatherNameParts = splitName(
               findKey(row, ['father name', 'father full name', 'fathers name', 'farther name', 'farthers name', 'farther full name']),
               findKey(row, ['father first name', 'father fname', 'farther first name', 'farther fname']),
               findKey(row, ['father last name', 'father lname', 'father surname', 'farther last name', 'farther lname'])
             );

             const motherNameParts = splitName(
               findKey(row, ['mother name', 'mother full name', 'mothers name']),
               findKey(row, ['mother first name', 'mother fname']),
               findKey(row, ['mother last name', 'mother lname', 'mother surname'])
             );

             const otherNameParts = splitName(
               findKey(row, ['other name', 'other full name']),
               findKey(row, ['other first name', 'other fname']),
               findKey(row, ['other last name', 'other lname', 'other surname'])
             );

             const permanentAddress = findKey(row, ['permanent address', 'address', 'perm address']);

             return {
                branch_id: parseInt(selectedBranch),
                branch_name,
                category_master_id: parseInt(selectedCategory),
                curriculum_name,
                admission_no: findKey(row, ['admission no', 'admission number', 'admissionno']),
                first_name: fName,
                middle_name: mName,
                last_name: lName,
                gender: findKey(row, ['gender', 'sex']) || 'Male',
                dob: findKey(row, ['dob', 'date of birth', 'birth date']),
                age: parseInt(findKey(row, ['age'])) || 0,
                date_of_admission: findKey(row, ['date of admission', 'admission date', 'doa']),
                student_type: findKey(row, ['student type', 'type']) || 'Local',
                academic_year: findKey(row, ['academic year', 'year']) || '2024/2025',
                enrolled_academic_yr: findKey(row, ['enrolled academic year', 'enrolled year']) || '2024/2025',
                grade: findKey(row, ['grade', 'class level']),
                class: findKey(row, ['class', 'section']),
                medium: findKey(row, ['medium', 'language']) || 'English',
                nationality: findKey(row, ['nationality']) || 'Sri Lankan',
                religion: findKey(row, ['religion']),
                emergency_contact: findKey(row, ['emergency contact', 'contact']),
                student_lives_with: findKey(row, ['student lives with', 'lives with']),
                guardian_type: findKey(row, ['guardian type', 'guardian']),
                marital_status: findKey(row, ['marital status', 'parents marital status']),
                is_living: findKey(row, ['is living', 'parents living']) || 'yes',
                status: 'active',
                parents: [
                  {
                    guardian_type: 'father',
                    nic: findKey(row, ['father nic', 'father id', 'f nic', 'farther nic', 'farther id']),
                    first_name: fatherNameParts.fName,
                    middle_name: fatherNameParts.mName,
                    last_name: fatherNameParts.lName,
                    mobile: findKey(row, ['father mobile', 'father phone', 'father contact', 'farther mobile', 'farther phone']),
                    personal_email: findKey(row, ['father email', 'father personal email', 'farther email']),
                    work_email: findKey(row, ['father work email', 'farther work email']),
                    home_phone: findKey(row, ['father home phone', 'home phone', 'farther home phone']),
                    permanent_address: permanentAddress
                  },
                  {
                    guardian_type: 'mother',
                    nic: findKey(row, ['mother nic', 'mother id', 'm nic']),
                    first_name: motherNameParts.fName,
                    middle_name: motherNameParts.mName,
                    last_name: motherNameParts.lName,
                    mobile: findKey(row, ['mother mobile', 'mother phone', 'mother contact']),
                    personal_email: findKey(row, ['mother email', 'mother personal email']),
                    work_email: findKey(row, ['mother work email']),
                    home_phone: findKey(row, ['mother home phone']),
                    permanent_address: permanentAddress
                  },
                  {
                    guardian_type: 'other',
                    nic: findKey(row, ['other nic']),
                    first_name: otherNameParts.fName,
                    middle_name: otherNameParts.mName,
                    last_name: otherNameParts.lName,
                    mobile: findKey(row, ['other mobile']),
                    personal_email: findKey(row, ['other email']),
                    work_email: findKey(row, ['other work email']),
                    home_phone: findKey(row, ['other home phone']),
                    permanent_address: permanentAddress
                  }
                ].filter(p => p.first_name || p.mobile || p.nic)
             }
          }).filter(r => r.admission_no || r.first_name)

          setParsedData(parsed)
          toast.success("Successfully parsed CSV data locally!")
        } catch (error) {
          toast.error("Error mapping CSV data")
        } finally {
          setIsParsing(false)
        }
      },
      error: (error) => {
        toast.error("Error reading file")
        setIsParsing(false)
      }
    })
  }

  const handleParseAI = async () => {
    if (!file) return toast.error("Please select a file.")
    if (!selectedBranch) return toast.error("Please select a branch.")
    if (!selectedCategory) return toast.error("Please select a curriculum.")

    setIsParsing(true)
    try {
      const branch_name = branches.find(b => b.branch_id.toString() === selectedBranch)?.branch_name
      const curriculum_name = categories.find(c => c.category_id.toString() === selectedCategory)?.category_name

      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        
        try {
          const res = await fetch('/api/ai-csv-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              csvData: text,
              branch_id: parseInt(selectedBranch),
              branch_name,
              category_master_id: parseInt(selectedCategory),
              curriculum_name
            })
          })

          const result = await res.json()
          if (res.ok && result.success) {
            setParsedData(result.data)
            toast.success("Successfully parsed CSV data using AI!")
          } else {
            toast.error(result.error || "Failed to parse data")
          }
        } catch (error: any) {
          toast.error("Error communicating with AI parser")
        } finally {
          setIsParsing(false)
        }
      }
      reader.readAsText(file)

    } catch (error) {
      toast.error("Error reading file")
      setIsParsing(false)
    }
  }

  const handleSubmitBulk = async () => {
    if (parsedData.length === 0) return

    setIsSubmitting(true)
    try {
      const res = await submitBulkStudentData(parsedData)
      if (res.success) {
        setImportResult(res.results)
        toast.success(`Import completed. ${res.results.successful} succeeded, ${res.results.failed} failed.`)
      } else {
        toast.error("Failed to submit data")
      }
    } catch (error) {
      toast.error("An error occurred during submission.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Import Student Data</h1>
        <p className="text-muted-foreground mt-2">
          Upload a CSV or Excel file containing student data. Our AI agent will automatically map the columns to the correct format.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Select Branch & Curriculum</CardTitle>
            <CardDescription>All students in the imported file will be assigned to these selections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={selectedBranch} onValueChange={(val) => setSelectedBranch(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.branch_id} value={b.branch_id.toString()}>
                      {b.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Curriculum</Label>
              <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Curriculum" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.category_id} value={c.category_id.toString()}>
                      {c.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Upload File & Parse</CardTitle>
            <CardDescription>Upload the CSV file to be processed by the AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CSV File</Label>
              <div className="flex items-center gap-4">
                <Input type="file" accept=".csv" onChange={handleFileChange} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleParseLocal}
                disabled={isParsing || !file || !selectedBranch || !selectedCategory}
              >
                {isParsing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Parse Locally (Fast & Free)</>
                )}
              </Button>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={handleParseAI}
                disabled={isParsing || !file || !selectedBranch || !selectedCategory}
              >
                {isParsing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Parse with AI (Groq)</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {parsedData.length > 0 && !importResult && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>3. Preview & Import</CardTitle>
                <CardDescription>Review the AI-mapped data below. Ensure everything looks correct before importing.</CardDescription>
              </div>
              <Button onClick={handleSubmitBulk} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                ) : (
                  "Confirm & Import Data"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-3 font-medium">Admission No</th>
                    <th className="p-3 font-medium">First Name</th>
                    <th className="p-3 font-medium">Last Name</th>
                    <th className="p-3 font-medium">Gender</th>
                    <th className="p-3 font-medium">Grade</th>
                    <th className="p-3 font-medium">Class</th>
                    <th className="p-3 font-medium">Enrolled Academic Yr</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3">{row.admission_no}</td>
                      <td className="p-3">{row.first_name}</td>
                      <td className="p-3">{row.last_name}</td>
                      <td className="p-3">{row.gender}</td>
                      <td className="p-3">{row.grade}</td>
                      <td className="p-3">{row.class}</td>
                      <td className="p-3">{row.enrolled_academic_yr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Showing {parsedData.length} extracted records.</p>
          </CardContent>
        </Card>
      )}

      {importResult && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" /> Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Successfully Imported</p>
                <p className="text-3xl font-bold text-green-700">{importResult.successful}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Failed to Import</p>
                <p className="text-3xl font-bold text-red-700">{importResult.failed}</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 flex items-center mb-2">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Errors Log
                </h4>
                <ul className="text-sm text-red-600 space-y-1 list-disc pl-5 max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="mt-4" onClick={() => {
              setParsedData([])
              setImportResult(null)
              setFile(null)
            }}>Import Another File</Button>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200 mt-8">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Use this section carefully. These actions cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAllData}
            disabled={isDeletingData}
          >
            {isDeletingData ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting All Data...</>
            ) : (
              "Delete All Student Data"
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will permanently remove all imported student records from the database. Use this only for resetting testing data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
