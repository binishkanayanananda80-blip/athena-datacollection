import branchMappingsData from './branch-mappings.json';

export interface IdMappings {
  section_id: number | null;
  section_name: string | null;
  grade_id: number | null;
  class_id: number | null;
}

export interface BranchMappingEntry {
  branch_id: number;
  branch_name: string;
  category_master_id?: number;
  category_master_name?: string;
  academic_year_id?: number;
  academic_year_name?: string;
  section_id: number;
  section_name: string;
  grade_id: number;
  grade_name: string;
  class_id: number;
  class_name: string;
}

const mappings: BranchMappingEntry[] = branchMappingsData as BranchMappingEntry[];

export function getAcademicYearIdForBranch(branch_id: number | string, yearName: string, branchName?: string): number | null {
  const branchIdNum = typeof branch_id === 'string' ? parseInt(branch_id, 10) : branch_id;
  const normalizedYear = (yearName || "").trim();
  if (!normalizedYear) return null;
  
  let branchMappings = mappings.filter(entry => entry.branch_id === branchIdNum);
  if (branchMappings.length === 0 && branchName) {
    const normalizedBranchName = branchName.trim().toLowerCase();
    branchMappings = mappings.filter(entry => entry.branch_name.toLowerCase() === normalizedBranchName);
  }

  const match = branchMappings.find(entry => entry.academic_year_name === normalizedYear);
  
  if (match && match.academic_year_id) return match.academic_year_id;
  
  // fallback without branch_id, just in case
  const fallback = mappings.find(entry => entry.academic_year_name === normalizedYear);
  return fallback?.academic_year_id || null;
}

/**
 * Maps a branch_id, grade, and className to their respective IDs using the pre-compiled JSON mappings.
 */
export function getMappedIds(branch_id: number | string, grade: string, className: string, branchName?: string): IdMappings {
  const branchIdNum = typeof branch_id === 'string' ? parseInt(branch_id, 10) : branch_id;
  
  let normalizedGrade = (grade || "").trim();
  let normalizedClass = (className || "").trim();

  // Normalize grade to handle typos and standard formats
  normalizedGrade = normalizedGrade.replace(/kingdergarten/ig, "Kindergarten");
  normalizedGrade = normalizedGrade.replace(/kindergard.*/ig, "Kindergarten");
  normalizedGrade = normalizedGrade.replace(/-\d+$/, "").trim();
  normalizedGrade = normalizedGrade.replace(/(\bForm|\bGrade|\bPrimary)\s+(\d)$/i, '$1 0$2');
  normalizedGrade = normalizedGrade.replace(/(\bForm|\bGrade|\bPrimary)(\d)$/i, '$1 0$2');
  
  const strippedClass = normalizedClass.replace(/-\d+$/, "").trim();
  const lowerGrade = normalizedGrade.toLowerCase();
  
  // Build common class prefixes based on the grade
  let prefix = "";
  if (lowerGrade.includes("kindergarten 1")) prefix = "KG 1";
  else if (lowerGrade.includes("kindergarten 2")) prefix = "KG 2";
  else if (lowerGrade.includes("primary 01") || lowerGrade.includes("primary 1")) prefix = "1";
  else if (lowerGrade.includes("primary 02") || lowerGrade.includes("primary 2")) prefix = "2";
  else if (lowerGrade.includes("primary 03") || lowerGrade.includes("primary 3")) prefix = "3";
  else if (lowerGrade.includes("primary 04") || lowerGrade.includes("primary 4")) prefix = "4";
  else if (lowerGrade.includes("primary 05") || lowerGrade.includes("primary 5")) prefix = "5";
  else if (lowerGrade.includes("play group")) prefix = "PG";
  else if (lowerGrade.includes("grade 09") || lowerGrade.includes("grade 9")) prefix = "9";
  else if (lowerGrade.includes("form 01") || lowerGrade.includes("form 1")) prefix = "1";
  else if (lowerGrade.includes("form 02") || lowerGrade.includes("form 2")) prefix = "2";
  else if (lowerGrade.includes("form 03") || lowerGrade.includes("form 3")) prefix = "3";
  else if (lowerGrade.includes("form 04") || lowerGrade.includes("form 4")) prefix = "4";
  else if (lowerGrade.includes("form 05") || lowerGrade.includes("form 5")) prefix = "5";

  // List of possible variations of the class name
  const potentialClasses = [
    normalizedClass,
    strippedClass,
    prefix ? `${prefix} ${normalizedClass}` : null,
    prefix ? `${prefix}${normalizedClass}` : null,
    prefix ? `${prefix} ${strippedClass}` : null,
    prefix ? `${prefix}${strippedClass}` : null,
    normalizedClass.replace(/\s+/g, '')
  ].filter(Boolean).map(c => c!.toLowerCase());

  // Filter mappings to just the requested branch
  let branchMappings = mappings.filter(entry => entry.branch_id === branchIdNum);
  if (branchMappings.length === 0 && branchName) {
    const normalizedBranchName = branchName.trim().toLowerCase();
    branchMappings = mappings.filter(entry => entry.branch_name.toLowerCase() === normalizedBranchName);
  }

  const exactClassMatches = branchMappings.filter(entry => 
    potentialClasses.includes(entry.class_name.toLowerCase()) || 
    entry.class_name.toLowerCase() === normalizedClass.toLowerCase().replace(/\s+/g, '')
  );

  // Find grade matches using flexible substring matching
  let gradeMatches = branchMappings.filter(entry => 
    entry.grade_name.toLowerCase() === lowerGrade || 
    entry.grade_name.toLowerCase().includes(lowerGrade) ||
    lowerGrade.includes(entry.grade_name.toLowerCase())
  );

  if (exactClassMatches.length === 1) {
    const match = exactClassMatches[0];
    return {
      section_id: match.section_id,
      section_name: match.section_name,
      grade_id: match.grade_id,
      class_id: match.class_id
    };
  } else if (exactClassMatches.length > 1) {
    const classMatchWithinGrade = exactClassMatches.find(c => gradeMatches.some(g => g.grade_id === c.grade_id));
    if (classMatchWithinGrade) {
      return {
        section_id: classMatchWithinGrade.section_id,
        section_name: classMatchWithinGrade.section_name,
        grade_id: classMatchWithinGrade.grade_id,
        class_id: classMatchWithinGrade.class_id
      };
    }
  }

  if (gradeMatches.length === 0) {
    return { section_id: null, section_name: null, grade_id: null, class_id: null };
  }

  // Find exact class match among the grade matches using our generated potential class combinations
  let classMatch = gradeMatches.find(entry => 
    potentialClasses.includes(entry.class_name.toLowerCase())
  );

  // Fallback: If exact prefix combo doesn't match, check if it ends with the class letter
  if (!classMatch) {
    classMatch = gradeMatches.find(entry => 
      entry.class_name.toLowerCase().endsWith(normalizedClass.toLowerCase()) ||
      entry.class_name.toLowerCase().endsWith(strippedClass.toLowerCase())
    );
  }

  if (classMatch) {
    return {
      section_id: classMatch.section_id,
      section_name: classMatch.section_name,
      grade_id: classMatch.grade_id,
      class_id: classMatch.class_id
    };
  }

  // If no class match was found, return the grade match.
  // If this grade only has exactly ONE class available in this branch (like Play Group), safely assume that's the correct class.
  const fallback = gradeMatches[0];
  return { 
    section_id: fallback.section_id, 
    section_name: fallback.section_name, 
    grade_id: fallback.grade_id, 
    class_id: gradeMatches.length === 1 ? fallback.class_id : null 
  };
}
