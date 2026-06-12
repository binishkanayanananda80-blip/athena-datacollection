import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const maxDuration = 60; // Allow 60 seconds for AI processing

export async function POST(request: Request) {
  try {
    const { csvData, branch_id, branch_name, category_master_id, curriculum_name } = await request.json()

    if (!csvData) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key is not configured' }, { status: 500 })
    }

    const groq = new Groq({ apiKey })

    const prompt = `
You are an expert data extraction agent. The user is providing a raw CSV text of student records.
Your job is to parse this CSV and map the columns to our strict JSON schema.

Here is the context:
- branch_id: ${branch_id}
- branch_name: "${branch_name}"
- category_master_id: ${category_master_id}
- curriculum_name: "${curriculum_name}"

Return a JSON object with a single key "students" containing an array of objects. Each object MUST have exactly these keys:
"branch_id", "branch_name", "admission_no", "first_name", "middle_name", "last_name", "gender", "dob", "age", "date_of_admission", "student_type", "category_master_id", "curriculum_name", "academic_year", "enrolled_academic_yr", "grade", "class", "medium", "nationality", "religion", "emergency_contact", "student_lives_with", "guardian_type", "marital_status", "is_living", "status".

Rules for mapping:
1. Infer the "first_name", "middle_name", "last_name", etc. from the CSV columns. Note that "second name" or "sname" should be mapped to "middle_name". If middle name is missing, leave it empty string "".
2. For "age", if missing, calculate it based on "dob" (Date of Birth) compared to the current year.
3. For "gender", map to "Male" or "Female".
4. "status" should default to "active".
5. Use the provided branch_id, branch_name, category_master_id, and curriculum_name for every record.
6. The output MUST be a valid JSON object.

CSV Data:
${csvData}
`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an AI that converts raw CSV text to a structured JSON object according to user instructions. Always output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No text returned from Groq")
    }

    const parsedObj = JSON.parse(text)
    const parsedData = parsedObj.students || parsedObj // Fallback in case it returns the array directly or under a different key

    if (!Array.isArray(parsedData)) {
      throw new Error("AI did not return an array of students.")
    }

    return NextResponse.json({ success: true, data: parsedData })
    
  } catch (error: any) {
    console.error("AI CSV Parsing Error:", error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to process CSV via AI' }, { status: 500 })
  }
}
