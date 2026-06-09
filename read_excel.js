const xlsx = require('xlsx');

const workbook = xlsx.readFile('StudentMasterDatalocal system.xlsx');

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  if (data.length === 0) {
    console.log("Sheet is empty.");
  } else {
    const headers = Object.keys(data[0]);
    console.log("Headers:");
    console.log(headers);
    
    console.log("\nSample rows (first 1):");
    console.log(data.slice(0, 1));
    
    console.log("\nUnique values per column:");
    headers.forEach(header => {
      const uniqueValues = new Set();
      data.forEach(row => {
        if (row[header] !== undefined && row[header] !== null && row[header] !== '') {
          uniqueValues.add(row[header]);
        }
      });
      if (uniqueValues.size < 20 && uniqueValues.size > 0) {
        console.log(`- ${header}: [${Array.from(uniqueValues).join(', ')}]`);
      } else {
        console.log(`- ${header}: ${uniqueValues.size} unique values`);
      }
    });
  }
});
