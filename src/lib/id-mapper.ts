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
  section_id: number;
  section_name: string;
  grade_id: number;
  grade_name: string;
  class_id: number;
  class_name: string;
}

const mappings: BranchMappingEntry[] = branchMappingsData as BranchMappingEntry[];

/**
 * Maps a branch_id, grade, and className to their respective IDs using the pre-compiled JSON mappings.
 */
export function getMappedIds(branch_id: number | string, grade: string, className: string): IdMappings {
  const branchIdNum = typeof branch_id === 'string' ? parseInt(branch_id, 10) : branch_id;
  const normalizedGrade = (grade || "").trim().toLowerCase();
  const normalizedClass = (className || "").trim().toLowerCase();

  // Find matching entry based on branch, grade, and class
  let match = mappings.find(entry => 
    entry.branch_id === branchIdNum && 
    entry.grade_name.toLowerCase() === normalizedGrade && 
    entry.class_name.toLowerCase() === normalizedClass
  );

  // Fallback: If exact class doesn't match, at least try to match the grade and branch
  if (!match) {
    match = mappings.find(entry => 
      entry.branch_id === branchIdNum && 
      entry.grade_name.toLowerCase() === normalizedGrade
    );
  }

  if (match) {
    return {
      section_id: match.section_id,
      section_name: match.section_name,
      grade_id: match.grade_id,
      // If we had an exact match, class_id is accurate. If it was a fallback, we still return the fallback class_id or we could return null.
      // Since it's better to be exact, we'll check if the class matched or if it was a fallback.
      class_id: match.class_name.toLowerCase() === normalizedClass ? match.class_id : null
    };
  }

  // Default values if no mapping is found
  return { 
    section_id: null, 
    section_name: null, 
    grade_id: null, 
    class_id: null 
  };
}
