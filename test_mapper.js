const fs = require('fs');
const branchMappingsData = JSON.parse(fs.readFileSync('src/lib/branch-mappings.json', 'utf8'));

function getMappedIdsTest(branch_id, grade, className) {
  const branchIdNum = parseInt(branch_id, 10);
  let normalizedGrade = (grade || "").trim();
  let normalizedClass = (className || "").trim();

  // Normalize grade
  normalizedGrade = normalizedGrade.replace(/kingdergarten/ig, "Kindergarten");
  normalizedGrade = normalizedGrade.replace(/-\d+$/, "").trim();
  normalizedGrade = normalizedGrade.replace(/(\bForm|\bGrade|\bPrimary)\s+(\d)$/i, '$1 0$2');
  normalizedGrade = normalizedGrade.replace(/(\bForm|\bGrade|\bPrimary)(\d)$/i, '$1 0$2');
  
  const strippedClass = normalizedClass.replace(/-\d+$/, "").trim();
  const lowerGrade = normalizedGrade.toLowerCase();
  
  // Try to generate prefixed classes
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

  const potentialClasses = [
    normalizedClass,
    strippedClass,
    prefix ? `${prefix} ${normalizedClass}` : null,
    prefix ? `${prefix}${normalizedClass}` : null,
    prefix ? `${prefix} ${strippedClass}` : null,
    prefix ? `${prefix}${strippedClass}` : null
  ].filter(Boolean).map(c => c.toLowerCase());

  const branchMappings = branchMappingsData.filter(entry => entry.branch_id === branchIdNum);
  
  // Find grade match
  let gradeMatches = branchMappings.filter(entry => 
    entry.grade_name.toLowerCase() === lowerGrade || 
    entry.grade_name.toLowerCase().includes(lowerGrade) ||
    lowerGrade.includes(entry.grade_name.toLowerCase())
  );

  if (gradeMatches.length === 0) return null;

  // Find exact class match among grade matches
  let classMatch = gradeMatches.find(entry => 
    potentialClasses.includes(entry.class_name.toLowerCase())
  );

  // Fallback: ends with
  if (!classMatch) {
    classMatch = gradeMatches.find(entry => 
      entry.class_name.toLowerCase().endsWith(normalizedClass.toLowerCase()) ||
      entry.class_name.toLowerCase().endsWith(strippedClass.toLowerCase())
    );
  }

  if (classMatch) {
    return classMatch;
  }

  return gradeMatches[0]; // fallback to grade only
}

console.log(getMappedIdsTest(10, 'Kindergart', 'A'));
console.log(getMappedIdsTest(10, 'Kindergarten 1', 'A'));
console.log(getMappedIdsTest(1, 'Play Group', 'Play Group'));
