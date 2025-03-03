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
    
    // Disable save buttons initially
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
        const studentName = row.cells[0].textContent;
        const studentGroup = row.cells[1].textContent;
        
        selectedStudents.push({
            id: studentId,
            name: studentName,
            group: studentGroup
        });
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
        const studentName = row.cells[0].textContent;
        
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-student-id', studentId);
        
        newRow.innerHTML = `
            <td>${studentName}</td>
            <td>${amount}</td>
            <td><input type="number" class="dialog-input payment-amount" value="${amount}" min="0" step="0.01"></td>
        `;
        
        paymentRefStudentsTable.appendChild(newRow);
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
        const studentName = row.cells[0].textContent;
        
        selectedStudents.push({
            id: studentId,
            name: studentName
        });
    });
    
    // Create cost records for each student
    selectedStudents.forEach(student => {
        // In a real implementation, this would send a request to Airtable
        // For now, we'll just simulate it
        const newCost = {
            id: `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date,
            purpose,
            studentID: student.id,
            studentName: student.name,
            amount,
            notes: []
        };
        
        // Add to costs array
        costs.push(newCost);
    });
    
    // Close dialogs
    closeConfirmCostDialog();
    closeCreateCostDialog();
    
    // Show notification
    alert(`Cost created successfully for ${selectedStudents.length} student(s).`);
    
    // Refresh the display
    applyAllFilters();
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
    
    // Create cost and payment records for each student
    studentsData.forEach(student => {
        // Create cost record
        const newCost = {
            id: `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date,
            purpose,
            studentID: student.id,
            studentName: student.name,
            amount: student.costAmount,
            notes: []
        };
        
        // Create payment record
        const newPayment = {
            id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date,
            purpose,
            studentID: student.id,
            studentName: student.name,
            amount: student.paymentAmount
        };
        
        // Add to arrays
        costs.push(newCost);
        payments.push(newPayment);
    });
    
    // Close dialogs
    closeConfirmCostPaymentDialog();
    closeCreatePaymentReferenceDialog();
    closeCreateCostDialog();
    
    // Show notification
    alert(`Cost and payment records created successfully for ${studentsData.length} student(s).`);
    
    // Refresh the display
    applyAllFilters();
}
