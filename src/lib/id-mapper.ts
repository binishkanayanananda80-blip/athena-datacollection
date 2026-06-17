export interface IdMappings {
  section_id: number | null;
  grade_id: number | null;
  class_id: number | null;
}

/**
 * Maps a branch_id, grade, and className to their respective IDs.
 * The mappings are based on the branch ID selection.
 * Defaults to null if no specific mapping is found.
 */
export function getMappedIds(branch_id: number | string, grade: string, className: string): IdMappings {
  const branchIdNum = typeof branch_id === 'string' ? parseInt(branch_id, 10) : branch_id;
  const normalizedGrade = (grade || "").trim().toLowerCase();
  const normalizedClass = (className || "").trim().toLowerCase();

  // Default values
  let section_id: number | null = null;
  let grade_id: number | null = null;
  let class_id: number | null = null;

  if (branchIdNum === 1) {
    // Panadura branch mapping
    if (normalizedGrade === "play group") {
      section_id = 1; // pre school ID
      grade_id = 1;
    }
    // Add other Panadura mappings here
    // Example (fallback logic can be added later):
    // if (normalizedGrade === "kindergarten 1") { grade_id = 2; }
    
    // Class mapping for Panadura
    if (normalizedClass === "play group") {
      class_id = 1;
    }
    // Add other class mappings here
    
  } else if (branchIdNum === 2) {
    // Galle branch mapping
    if (normalizedGrade === "play group") {
      section_id = 11; // pre school section ID
      grade_id = 37;
    }
    // Add other Galle mappings here
    
    // Class mapping for Galle
    if (normalizedClass === "play group") {
      class_id = 37; // Assuming play group class maps to play group grade
    }
    // Add other class mappings here
  }

  return { section_id, grade_id, class_id };
}
