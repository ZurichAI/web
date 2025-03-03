// Create cost dialog functions
function openCreateCostDialog() {
    // Clear previous inputs
    document.getElementById('cost-purpose').value = '';
    document.getElementById('cost-amount').value = '';
    
    // Clear students table
    document.getElementById('cost-students-table-body').innerHTML = '';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cost-date').value = today;
    
    // Check if there are selected rows in the costs table
    if (selectedCostRows.length > 0) {
        // Get unique students from selected cost rows
        const uniqueStudents = new Map();
        
        selectedCostRows.forEach(costId => {
            const cost = costs.find(c => c.id === costId);
            if (cost && cost.studentID && cost.studentName) {
                // Use Map to ensure uniqueness by student ID
                if (!uniqueStudents.has(cost.studentID)) {
                    uniqueStudents.set(cost.studentID, {
                        id: cost.studentID,
                        name: cost.studentName,
                        group: students.find(s => s.id === cost.studentID)?.group || ''
                    });
                }
            }
        });
        
        // Add selected students to the table
        uniqueStudents.forEach(student => {
            const studentsTable = document.getElementById('cost-students-table-body');
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-student-id', student.id);
            
            newRow.innerHTML = `
                <td>${student.name}</td>
                <td>${student.group}</td>
                <td>
                    <button class="btn btn-danger">Remove</button>
                </td>
            `;
            
            // Add event listener to remove button
            newRow.querySelector('button').addEventListener('click', () => {
                newRow.remove();
                validateCostForm();
            });
            
            studentsTable.appendChild(newRow);
        });
        
        // Validate form to enable/disable save buttons
        validateCostForm();
    }
    
    // Disable save buttons initially (will be enabled by validateCostForm if students are added)
    document.getElementById('save-cost-btn').disabled = true;
    document.getElementById('save-with-reference-payment-btn').disabled = true;
    
    // Show dialog
    document.getElementById('create-cost-dialog').style.display = 'flex';
}

function closeCreateCostDialog() {
    document.getElementById('create-cost-dialog').style.display = 'none';
}

function validateCostForm() {
    const purpose = document.getElementById('cost-purpose').value.trim();
    const amount = document.getElementById('cost-amount').value.trim();
    const studentsTable = document.getElementById('cost-students-table-body');
    const studentRows = studentsTable.querySelectorAll('tr');
    
    // Check if at least one student is selected
    let hasSelectedStudent = false;
    studentRows.forEach(row => {
        if (row.hasAttribute('data-student-id')) {
            hasSelectedStudent = true;
        }
    });
    
    // Enable save buttons only if all required fields are filled and at least one student is selected
    const saveCostBtn = document.getElementById('save-cost-btn');
    const saveWithReferencePaymentBtn = document.getElementById('save-with-reference-payment-btn');
    const isValid = purpose && amount && hasSelectedStudent;
    
    saveCostBtn.disabled = !isValid;
    saveWithReferencePaymentBtn.disabled = !isValid;
}

function openConfirmCostDialog() {
    // Get form values
    const date = document.getElementById('cost-date').value;
    const purpose = document.getElementById('cost-purpose').value.trim();
    const amount = document.getElementById('cost-amount').value.trim();
    
    // Get selected students
    const studentsTable = document.getElementById('cost-students-table-body');
    const studentRows = studentsTable.querySelectorAll('tr');
    const selectedStudents = [];
    
    studentRows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        // Only include rows that have a valid student ID
        if (studentId) {
            let studentName;
            const studentGroup = row.cells[1].textContent;
            
            // Check if the first cell contains a dropdown (added with "+ Add student" button)
            const dropdown = row.cells[0].querySelector('select');
            if (dropdown) {
                // Get the selected option's text
                const selectedOption = dropdown.options[dropdown.selectedIndex];
                studentName = selectedOption ? selectedOption.textContent : '';
            } else {
                // Regular row, get the text content
                studentName = row.cells[0].textContent;
            }
            
            // Skip rows where the student name is "Select a student"
            if (studentName !== 'Select a student') {
                selectedStudents.push({
                    id: studentId,
                    name: studentName,
                    group: studentGroup
                });
            }
        }
    });
    
    // Validate form
    if (!purpose || !amount || selectedStudents.length === 0) {
        alert('Please fill in all required fields and add at least one student.');
        return;
    }
    
    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString();
    
    // Create confirmation message
    const confirmMessage = `You are going to create the ${amount} CHF cost for ${purpose} for the following students:`;
    document.getElementById('confirm-cost-message').textContent = confirmMessage;
    
    // Create student list
    const confirmDetails = document.getElementById('confirm-cost-details');
    confirmDetails.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Student Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Group</th>
                </tr>
            </thead>
            <tbody>
                ${selectedStudents.map(student => `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.name}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.group}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <p>Are you sure?</p>
    `;
    
    // Show dialog
    document.getElementById('confirm-cost-dialog').style.display = 'flex';
}

function closeConfirmCostDialog() {
    document.getElementById('confirm-cost-dialog').style.display = 'none';
}

function openCreatePaymentReferenceDialog() {
    // Get form values from cost dialog
    const date = document.getElementById('cost-date').value;
    const purpose = document.getElementById('cost-purpose').value.trim();
    const amount = document.getElementById('cost-amount').value.trim();
    
    // Get selected students
    const studentsTable = document.getElementById('cost-students-table-body');
    const studentRows = studentsTable.querySelectorAll('tr');
    
    // Validate form
    if (!purpose || !amount || studentRows.length === 0) {
        alert('Please fill in all required fields and add at least one student.');
        return;
    }
    
    // Populate payment reference dialog
    document.getElementById('payment-ref-date').value = date;
    document.getElementById('payment-ref-purpose').value = purpose;
    
    // Populate students table
    const paymentRefStudentsTable = document.getElementById('payment-ref-students-table-body');
    paymentRefStudentsTable.innerHTML = '';
    
    studentRows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        // Only include rows that have a valid student ID
        if (studentId) {
            let studentName;
            
            // Check if the first cell contains a dropdown (added with "+ Add student" button)
            const dropdown = row.cells[0].querySelector('select');
            if (dropdown) {
                // Get the selected option's text
                const selectedOption = dropdown.options[dropdown.selectedIndex];
                studentName = selectedOption ? selectedOption.textContent : '';
            } else {
                // Regular row, get the text content
                studentName = row.cells[0].textContent;
            }
            
            // Skip rows where the student name is "Select a student"
            if (studentName !== 'Select a student') {
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-student-id', studentId);
                
                newRow.innerHTML = `
                    <td>${studentName}</td>
                    <td>${amount}</td>
                    <td><input type="number" class="dialog-input payment-amount" value="${amount}" min="0" step="0.01"></td>
                `;
                
                paymentRefStudentsTable.appendChild(newRow);
            }
        }
    });
    
    // Show dialog
    document.getElementById('create-payment-reference-dialog').style.display = 'flex';
}

function closeCreatePaymentReferenceDialog() {
    document.getElementById('create-payment-reference-dialog').style.display = 'none';
}

function openConfirmCostPaymentDialog() {
    // Get form values
    const date = document.getElementById('payment-ref-date').value;
    const purpose = document.getElementById('payment-ref-purpose').value;
    
    // Get students with cost and payment amounts
    const studentsTable = document.getElementById('payment-ref-students-table-body');
    const studentRows = studentsTable.querySelectorAll('tr');
    const studentsData = [];
    
    studentRows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        const studentName = row.cells[0].textContent;
        const costAmount = row.cells[1].textContent;
        const paymentAmount = row.querySelector('.payment-amount').value;
        
        studentsData.push({
            id: studentId,
            name: studentName,
            costAmount,
            paymentAmount
        });
    });
    
    // Create confirmation message
    const confirmMessage = `You are going to create the cost for ${purpose} and the payment for the following students:`;
    document.getElementById('confirm-cost-payment-message').textContent = confirmMessage;
    
    // Create student list with cost and payment amounts
    const confirmDetails = document.getElementById('confirm-cost-payment-details');
    confirmDetails.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Student Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Cost Amount</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Payment Amount</th>
                </tr>
            </thead>
            <tbody>
                ${studentsData.map(student => `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.name}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.costAmount}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.paymentAmount}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <p>Are you sure?</p>
    `;
    
    // Show dialog
    document.getElementById('confirm-cost-payment-dialog').style.display = 'flex';
}

function closeConfirmCostPaymentDialog() {
    document.getElementById('confirm-cost-payment-dialog').style.display = 'none';
}

function saveCost() {
    // Get form values
    const date = document.getElementById('cost-date').value;
    const purpose = document.getElementById('cost-purpose').value.trim();
    const amount = parseFloat(document.getElementById('cost-amount').value.trim());
    
    // Get selected students
    const studentsTable = document.getElementById('cost-students-table-body');
    const studentRows = studentsTable.querySelectorAll('tr');
    const selectedStudents = [];
    
    studentRows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        // Only include rows that have a valid student ID
        if (studentId) {
            let studentName;
            
            // Check if the first cell contains a dropdown (added with "+ Add student" button)
            const dropdown = row.cells[0].querySelector('select');
            if (dropdown) {
                // Get the selected option's text
                const selectedOption = dropdown.options[dropdown.selectedIndex];
                studentName = selectedOption ? selectedOption.textContent : '';
            } else {
                // Regular row, get the text content
                studentName = row.cells[0].textContent;
            }
            
            // Skip rows where the student name is "Select a student"
            if (studentName !== 'Select a student') {
                selectedStudents.push({
                    id: studentId,
                    name: studentName
                });
            }
        }
    });
    
    // Show loading indicator
    const saveButton = document.getElementById('save-confirm-cost-btn');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    
    let successCount = 0;
    let errorCount = 0;
    
    // Create a promise for each student to track all API calls
    const promises = selectedStudents.map(student => {
        // Prepare the data for Airtable
        const newCostData = {
            fields: {
                'CreatedDateTime': date,
                'Purpose of payment': purpose,
                'StudentID': student.id,
                'Student Name': student.name,
                'Amount CHF': amount
            }
        };
        
        // Make the API call to create the record
        const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.cost}`;
        
        return fetch(airtableApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.airtable.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCostData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Cost created successfully:', data);
            
            // Create a local cost object from the response
            const newCost = {
                id: data.id,
                date: data.fields.CreatedDateTime || date,
                purpose: data.fields['Purpose of payment'] || purpose,
                studentID: data.fields.StudentID || student.id,
                studentName: data.fields['Student Name'] || student.name,
                amount: data.fields['Amount CHF'] || amount,
                notes: []
            };
            
            // Add to costs array
            costs.push(newCost);
            successCount++;
        })
        .catch(error => {
            console.error('Error creating cost:', error);
            errorCount++;
            return Promise.resolve(); // Continue with other students even if one fails
        });
    });
    
    // Wait for all API calls to complete
    Promise.all(promises)
        .then(() => {
            // Reset button state before closing dialogs
            saveButton.disabled = false;
            saveButton.textContent = 'Yes';
            
            // Close dialogs
            closeConfirmCostDialog();
            closeCreateCostDialog();
            
            // Show notification
            if (successCount > 0) {
                alert(`Cost created successfully for ${successCount} student(s).${errorCount > 0 ? ` Failed for ${errorCount} student(s).` : ''}`);
            } else {
                alert('Failed to create costs. Please try again.');
            }
            
            // Refresh the display and update totals
            applyAllFilters();
        })
        .catch(error => {
            console.error('Error in Promise.all:', error);
            
            // Reset button state
            saveButton.disabled = false;
            saveButton.textContent = 'Yes';
        });
}

function saveCostAndPayment() {
    // Get form values
    const date = document.getElementById('payment-ref-date').value;
    const purpose = document.getElementById('payment-ref-purpose').value;
    
    // Get students with cost and payment amounts
    const studentsTable = document.getElementById('payment-ref-students-table-body');
    const studentRows = studentsTable.querySelectorAll('tr');
    const studentsData = [];
    
    studentRows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        const studentName = row.cells[0].textContent;
        const costAmount = parseFloat(row.cells[1].textContent);
        const paymentAmount = parseFloat(row.querySelector('.payment-amount').value);
        
        studentsData.push({
            id: studentId,
            name: studentName,
            costAmount,
            paymentAmount
        });
    });
    
    // Show loading indicator
    const saveButton = document.getElementById('save-confirm-cost-payment-btn');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    
    let successCount = 0;
    let errorCount = 0;
    
    // Create a promise for each student to track all API calls
    const promises = studentsData.map(student => {
        // Prepare the cost data for Airtable
        const newCostData = {
            fields: {
                'CreatedDateTime': date,
                'Purpose of payment': purpose,
                'StudentID': student.id,
                'Student Name': student.name,
                'Amount CHF': student.costAmount
            }
        };
        
        // Prepare the payment data for Airtable
        const newPaymentData = {
            fields: {
                'CreatedDateTime': date,
                'Purpose of payment': purpose,
                'StudentID': student.id,
                'Student Name': student.name,
                'Amount CHF': student.paymentAmount
            }
        };
        
        // Make the API calls to create the records
        const costApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.cost}`;
        const paymentApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.payment}`;
        
        // First create the cost record
        return fetch(costApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.airtable.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCostData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Airtable API error (cost): ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(costData => {
            console.log('Cost created successfully:', costData);
            
            // Create a local cost object from the response
            const newCost = {
                id: costData.id,
                date: costData.fields.CreatedDateTime || date,
                purpose: costData.fields['Purpose of payment'] || purpose,
                studentID: costData.fields.StudentID || student.id,
                studentName: costData.fields['Student Name'] || student.name,
                amount: costData.fields['Amount CHF'] || student.costAmount,
                notes: []
            };
            
            // Add to costs array
            costs.push(newCost);
            
            // Then create the payment record
            return fetch(paymentApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.airtable.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPaymentData)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Airtable API error (payment): ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(paymentData => {
            console.log('Payment created successfully:', paymentData);
            
            // Create a local payment object from the response
            const newPayment = {
                id: paymentData.id,
                date: paymentData.fields.CreatedDateTime || date,
                purpose: paymentData.fields['Purpose of payment'] || purpose,
                studentID: paymentData.fields.StudentID || student.id,
                studentName: paymentData.fields['Student Name'] || student.name,
                amount: paymentData.fields['Amount CHF'] || student.paymentAmount
            };
            
            // Add to payments array
            payments.push(newPayment);
            
            successCount++;
        })
        .catch(error => {
            console.error('Error creating cost and payment:', error);
            errorCount++;
            return Promise.resolve(); // Continue with other students even if one fails
        });
    });
    
    // Wait for all API calls to complete
    Promise.all(promises)
        .then(() => {
            // Reset button state before closing dialogs
            saveButton.disabled = false;
            saveButton.textContent = 'Yes';
            
            // Close dialogs
            closeConfirmCostPaymentDialog();
            closeCreatePaymentReferenceDialog();
            closeCreateCostDialog();
            
            // Show notification
            if (successCount > 0) {
                alert(`Cost and payment records created successfully for ${successCount} student(s).${errorCount > 0 ? ` Failed for ${errorCount} student(s).` : ''}`);
            } else {
                alert('Failed to create cost and payment records. Please try again.');
            }
            
            // Refresh the display and update totals
            applyAllFilters();
        })
        .catch(error => {
            console.error('Error in Promise.all:', error);
            
            // Reset button state
            saveButton.disabled = false;
            saveButton.textContent = 'Yes';
        });
}
