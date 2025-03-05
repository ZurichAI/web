// Fetch costs data for students page
async function fetchStudentCosts() {
    try {
        console.log('GET operation - Sending request for costs (students page)...');
        const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.cost}`;
        
        const response = await fetch(airtableApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.airtable.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('GET operation - Costs response data (students page):', data);
        
        // Format Airtable records to cost objects
        costs = data.records.map(record => {            
            return {
                id: record.id,
                date: record.fields.CreatedDateTime || '',
                purpose: record.fields['Purpose of payment'] || '',
                studentID: record.fields.StudentID || '',
                studentName: record.fields['Student Name'] || '',
                amount: record.fields['Amount CHF'] || 0,
                notes: record.fields.Notes || []
            };
        });
        
        console.log('Formatted costs array (students page):', costs);
        
        // Refresh the students table to show updated balances
        if (students.length > 0) {
            displayStudents(visibleStudents.length > 0 ? visibleStudents : students);
        }
    } catch (error) {
        console.error('Error fetching costs (students page):', error);
        // Don't show alert to avoid disrupting the user experience
    }
}

// Fetch payments data for students page
async function fetchStudentPayments() {
    try {
        console.log('GET operation - Sending request for payments (students page)...');
        const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.payment}`;
        
        const response = await fetch(airtableApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.airtable.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('GET operation - Payments response data (students page):', data);
        
        // Format Airtable records to payment objects
        payments = data.records.map(record => {
            return {
                id: record.id,
                date: record.fields.CreatedDateTime || '',
                purpose: record.fields['Purpose of payment'] || '',
                studentID: record.fields.StudentID || '',
                studentName: record.fields['Student Name'] || '',
                amount: record.fields['Amount CHF'] || 0
            };
        });
        
        console.log('Formatted payments array (students page):', payments);
        
        // Refresh the students table to show updated balances
        if (students.length > 0) {
            displayStudents(visibleStudents.length > 0 ? visibleStudents : students);
        }
    } catch (error) {
        console.error('Error fetching payments (students page):', error);
        // Don't show alert to avoid disrupting the user experience
    }
}

// Calculate balance for a student
function calculateStudentBalance(studentId) {
    // If costs or payments are not loaded yet, return 0
    if (!costs || !payments) {
        return 0;
    }
    
    // Filter payments for this student
    const studentPayments = payments.filter(payment => payment.studentID === studentId);
    
    // Filter costs for this student
    const studentCosts = costs.filter(cost => cost.studentID === studentId);
    
    // Calculate total payments
    const totalPayment = studentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    
    // Calculate total costs
    const totalCost = studentCosts.reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);
    
    // Calculate balance (payment - cost)
    return totalPayment - totalCost;
}

// Display students in the table
function displayStudents(filteredStudents = null) {
    const studentsToDisplay = filteredStudents || students;
    
    // Clear table
    const studentsTableBody = document.getElementById('students-table-body');
    studentsTableBody.innerHTML = '';
    
    // Add students to table
    studentsToDisplay.forEach(student => {
        const row = document.createElement('tr');
        
        // Format dates for display
        const formattedBirthday = new Date(student.birthday).toLocaleDateString();
        const formattedStartDate = new Date(student.startDate).toLocaleDateString();
        
        // Calculate balance for this student
        const balance = calculateStudentBalance(student.id);
        const formattedBalance = balance.toFixed(2);
        
        // Determine balance cell style based on value
        const balanceCellStyle = balance < 0 
            ? 'color: red;' 
            : 'color: green;';
        
        // Check if student has dossier records
        const hasDossierRecords = dossiers.some(dossier => dossier.studentID === student.id);
        const dossierIcon = hasDossierRecords ? '&#128488;' : '';
        
        // Make the comment cell clickable if it has dossier records
        const commentCellStyle = hasDossierRecords 
            ? 'text-align: center; font-size: 1.2em; cursor: pointer;' 
            : 'text-align: center; font-size: 1.2em;';
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-select" data-id="${student.id}"></td>
            <td>${student.name}</td>
            <td>${student.group}</td>
            <td>${student.instructor}</td>
            <td>${formattedBirthday}</td>
            <td>${formattedStartDate}</td>
            <td style="${balanceCellStyle}">${formattedBalance}</td>
            <td style="${commentCellStyle}" title="${hasDossierRecords ? 'Click to view comments' : 'No dossier records'}" data-id="${student.id}">${dossierIcon}</td>
        `;
        
        studentsTableBody.appendChild(row);
    });
    
    // Add event listeners to row checkboxes for single selection
    document.querySelectorAll('.row-select').forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
            if (this.checked) {
                // Uncheck all other checkboxes
                document.querySelectorAll('.row-select').forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
            }
            updateSelectedRows(event);
        });
    });
    
    // Add click event listeners to rows for selection
    document.querySelectorAll('#students-table tbody tr').forEach(row => {
        row.addEventListener('click', function(event) {
            // Skip if clicking on the comment cell with dossier records (it has its own click handler)
            if (event.target.hasAttribute('data-id') && 
                dossiers.some(dossier => dossier.studentID === event.target.getAttribute('data-id'))) {
                return;
            }
            
            // Skip if clicking on the checkbox itself (it has its own change handler)
            if (event.target.classList.contains('row-select')) {
                return;
            }
            
            // Find the checkbox in this row
            const checkbox = this.querySelector('.row-select');
            if (checkbox) {
                // Toggle the checkbox
                checkbox.checked = !checkbox.checked;
                
                // If checked, uncheck all other checkboxes
                if (checkbox.checked) {
                    document.querySelectorAll('.row-select').forEach(cb => {
                        if (cb !== checkbox) {
                            cb.checked = false;
                        }
                    });
                }
                
                // Update selected rows
                updateSelectedRows({ target: checkbox });
            }
        });
    });
    
    // Add event listeners to comment cells with dossier records
    document.querySelectorAll('#students-table-body td[data-id]').forEach(cell => {
        const studentId = cell.getAttribute('data-id');
        const hasDossierRecords = dossiers.some(dossier => dossier.studentID === studentId);
        
        if (hasDossierRecords) {
            cell.addEventListener('click', () => {
                openViewCommentsDialog(studentId);
            });
        }
    });
}

// Sort students by field
function sortStudents(field) {
    // Toggle sort direction if same field is clicked
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    // Sort students
    students.sort((a, b) => {
        let valueA, valueB;
        
        // Special case for balance which is calculated dynamically
        if (field === 'balance') {
            valueA = calculateStudentBalance(a.id);
            valueB = calculateStudentBalance(b.id);
        } else {
            valueA = a[field];
            valueB = b[field];
            
            // Handle special cases for sorting
            if (field === 'birthday' || field === 'startDate') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            } else if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
        }
        
        // Compare values
        if (valueA < valueB) {
            return currentSort.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return currentSort.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // Apply all filters
    applyAllFilters();
    
    // Update table headers
    const tableHeaders = document.querySelectorAll('#students-table th[data-sort]');
    tableHeaders.forEach(header => {
        const headerField = header.getAttribute('data-sort');
        if (headerField === field) {
            header.textContent = `${header.textContent.replace(' ▲', '').replace(' ▼', '')} ${currentSort.direction === 'asc' ? '▲' : '▼'}`;
        } else {
            header.textContent = header.textContent.replace(' ▲', '').replace(' ▼', '');
        }
    });
}
