const fs = require('fs');

const csvContent = fs.readFileSync('All_branches_grade_class_ids.csv', 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);

const headers = lines[0].split(',');
// branch_id,branch_name,section_id,section_name,grade_id,grade_name,class_id,class_name

const mappings = [];

for (let i = 1; i < lines.length; i++) {
  // Simple CSV split (assuming no commas in names)
  // Actually, there's "Grade 09, Grade 10, Grade 11 & Grade 12" which has commas!
  // We need a proper CSV parser or regex for quoted strings.
  const line = lines[i];
  let inQuotes = false;
  let currentVal = '';
  const row = [];
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  row.push(currentVal.trim());
  
  if (row.length === 8) {
    mappings.push({
      branch_id: parseInt(row[0], 10),
      branch_name: row[1],
      section_id: parseInt(row[2], 10),
      section_name: row[3],
      grade_id: parseInt(row[4], 10),
      grade_name: row[5],
      class_id: parseInt(row[6], 10),
      class_name: row[7],
    });
  }
}

fs.writeFileSync('src/lib/branch-mappings.json', JSON.stringify(mappings, null, 2));
console.log('Successfully generated src/lib/branch-mappings.json with ' + mappings.length + ' entries.');
