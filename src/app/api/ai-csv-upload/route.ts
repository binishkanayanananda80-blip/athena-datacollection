import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const maxDuration = 60; // Allow 60 seconds for AI processing

export async function POST(request: Request) {
  try {
    const { csvData, branch_id, branch_name, category_master_id, curriculum_name } = await request.json()

    if (!csvData) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `
You are an expert data extraction agent. The user is providing a raw CSV text of student records.
Your job is to parse this CSV and map the columns to our strict JSON schema.

Here is the context:
- branch_id: ${branch_id}
- branch_name: "${branch_name}"
- category_master_id: ${category_master_id}
- curriculum_name: "${curriculum_name}"

Return a JSON array of objects. Each object MUST have exactly these keys:
"branch_id", "branch_name", "admission_no", "first_name", "middle_name", "last_name", "gender", "dob", "age", "date_of_admission", "student_type", "category_master_id", "curriculum_name", "academic_year", "enrolled_academic_year", "grade", "class", "medium", "nationality", "religion", "emergency_contact", "student_lives_with", "guardian_type", "marital_status", "is_living", "status".

Rules for mapping:
1. Infer the "first_name", "last_name", etc. from the CSV columns (they might be named "Student Name", "Name", "FName", etc.). If middle name is missing, leave it empty string "".
2. For "age", if missing, calculate it based on "dob" (Date of Birth) compared to the current year.
3. For "gender", map to "Male" or "Female".
4. "status" should default to "active".
5. Use the provided branch_id, branch_name, category_master_id, and curriculum_name for every record.
6. The output MUST be a valid JSON array and nothing else. No markdown wrapping. Just the raw JSON array.

CSV Data:
${csvData}
`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    })

    const text = response.text
    if (!text) {
      throw new Error("No text returned from Gemini")
    }

    const parsedData = JSON.parse(text)
    return NextResponse.json({ success: true, data: parsedData })
    
  } catch (error: any) {
    console.error("AI CSV Parsing Error:", error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to process CSV via AI' }, { status: 500 })
  }
}
