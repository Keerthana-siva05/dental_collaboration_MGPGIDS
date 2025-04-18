import xlsx from 'xlsx';
import Student from '../models/Student.js';
import bcrypt from 'bcrypt';
// import { calculateValidity } from '../utils/helpers.js';

export const processStudentExcel = async (filePath, course, startYear, endYear) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const results = {
    success: 0,
    errors: [],
    duplicates: 0
  };

  // First pass: Validate all rows before insertion
  for (const [index, row] of data.entries()) {
    const { 'Register No': registerNo, Name: name, Email: email } = row;
    
    if (!registerNo || String(registerNo).trim() === '') {
      results.errors.push({
        row: index + 2,
        registerNo: 'MISSING',
        error: 'Register number is required'
      });
      continue;
    }

    const cleanRegisterNo = String(registerNo).trim();
    
    try {
      const exists = await Student.findOne({ 
        registerNo: cleanRegisterNo 
      }).lean();
      
      if (exists) {
        results.duplicates++;
        results.errors.push({
          row: index + 2,
          registerNo: cleanRegisterNo,
          error: `Duplicate register number: ${cleanRegisterNo}`
        });
      }
    } catch (err) {
      results.errors.push({
        row: index + 2,
        registerNo: cleanRegisterNo,
        error: 'Error checking existence'
      });
    }
  }

  // If validation errors found, stop here
  if (results.errors.length > 0) {
    return results;
  }

  // Second pass: Insert valid records
  for (const [index, row] of data.entries()) {
    try {
      const { 'Register No': registerNo, Name: name, Email: email } = row;
      // const cleanRegisterNo = String(registerNo).trim();

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(registerNo, saltRounds);

      const student = new Student({
        registerNo: registerNo,
        name,
        email,
        password: hashedPassword, // or hash it
        course,
        batch: { startYear, endYear },
        validity: new Date(endYear, 6, 1), // July 1 of end year
        status: 'active'
      });

      await student.save();
      results.success++;
    } catch (error) {
      results.errors.push({
        row: index + 2,
        registerNo: row['Register No'] || 'N/A',
        error: error.message
      });
    }
  }

  return results;
};

//   for (const [index, row] of data.entries()) {
//     try {
//       const { 'Register No': registerNo, Name: name, Email: email } = row;

//       if (!registerNo || typeof registerNo !== 'string' || registerNo.trim() === '') {
//         throw new Error('Register number is required and cannot be empty');
//       }

//       // Ensure registerNo is a string
//       const cleanRegisterNo = registerNo.toString().trim();

//       // Check for existing student
//       const existingStudent = await Student.findOne({ 
//         $or: [
//           { registerNo: cleanRegisterNo },
//           { email }
//         ] 
//       });
      
//       if (existingStudent) {
//         throw new Error(existingStudent.registerNo === cleanRegisterNo 
//           ? 'Register number already exists' 
//           : 'Email already exists');
//       }
      
//     //   if (!registerNo || !name || !email) {
//     //     throw new Error('Missing required fields');
//     //   }

//     //   // Check if student already exists
//     //   const existingStudent = await Student.findOne({ $or: [{ registerNo }, { email }] });
//     //   if (existingStudent) {
//     //     throw new Error('Student already exists');
//     //   }

      
//       // Calculate validity (July 1st of end year)
//       const validity = new Date(endYear, 6, 1); // Month is 0-indexed (6 = July)

//       // Create new student (using registerNo as password)
//       const student = new Student({
//         registerNo: cleanRegisterNo,
//         name,
//         email,
//         password: cleanRegisterNo, // Using registerNo as initial password
//         dob: new Date('2000-01-01'), // Default DOB, can be updated later
//         course,
//         batch: { startYear, endYear },
//         validity, // Explicitly set validity
//         status: 'active'
//         // validity and status will be set automatically by schema
//       });

//       await student.save();
//       results.success++;
//     } catch (error) {
//       results.errors.push({
//         row: index + 2,
//         registerNo: row['Register No'] || 'N/A',
//         error: error.message
//       });
//     }
//   }

//   return results;
// };