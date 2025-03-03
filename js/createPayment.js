// Create payment dialog functions
function openCreatePaymentDialog() {
    // Clear previous inputs
    document.getElementById('payment-purpose').value = '';
    document.getElementById('payment-amount').value = '';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;
    
    // Populate student dropdown
    const studentSelect = document.getElementById('payment-student');
    studentSelect.innerHTML = '<option value="">Select a student</option>';
    
    // If a student is selected in the costs or payments table, preselect them
    let selectedStudentName = '';
    
    if (selectedCostRows.length === 1) {
        const costId = selectedCostRows[0];
        const cost = costs.find(c => c.id === costId);
        if (cost) {
            selectedStudentName = cost.studentName;
        }
    } else if (selectedPaymentRows.length === 1) {
        const paymentId = selectedPaymentRows[0];
        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
            selectedStudentName = payment.studentName;
        }
    }
    
    // Add all students to the dropdown
    studentNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        option.selected = name === selectedStudentName;
        studentSelect.appendChild(option);
    });
    
    // Validate form to enable/disable save button
    validatePaymentForm();
    
    // Show dialog
    document.getElementById('create-payment-dialog').style.display = 'flex';
}

function closeCreatePaymentDialog() {
    document.getElementById('create-payment-dialog').style.display = 'none';
}

function validatePaymentForm() {
    const amount = document.getElementById('payment-amount').value.trim();
    const studentSelect = document.getElementById('payment-student');
    const studentSelected = studentSelect.value !== '';
    
    // Enable save button only if required fields are filled
    const savePaymentDialogBtn = document.getElementById('save-payment-dialog-btn');
    savePaymentDialogBtn.disabled = !(amount && studentSelected);
}

function openConfirmPaymentDialog() {
    // Get form values
    const date = document.getElementById('payment-date').value;
    const purpose = document.getElementById('payment-purpose').value.trim() || 'N/A';
    const amount = document.getElementById('payment-amount').value.trim();
    const studentSelect = document.getElementById('payment-student');
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;
    
    // Validate form
    if (!amount || !studentName) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Create confirmation message
    const confirmMessage = `You are going to create the ${amount} CHF payment for ${purpose} for the ${studentName}. Are you sure?`;
    document.getElementById('confirm-payment-message').textContent = confirmMessage;
    
    // Show dialog
    document.getElementById('confirm-payment-dialog').style.display = 'flex';
}

function closeConfirmPaymentDialog() {
    document.getElementById('confirm-payment-dialog').style.display = 'none';
}

function savePayment() {
    // Get form values
    const date = document.getElementById('payment-date').value;
    const purpose = document.getElementById('payment-purpose').value.trim() || '';
    const amount = parseFloat(document.getElementById('payment-amount').value.trim());
    const studentSelect = document.getElementById('payment-student');
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;
    const studentId = students.find(s => s.name === studentName)?.id || '';
    
    // Create payment record
    const newPayment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        purpose,
        studentID: studentId,
        studentName,
        amount
    };
    
    // Add to payments array
    payments.push(newPayment);
    
    // Close dialogs
    closeConfirmPaymentDialog();
    closeCreatePaymentDialog();
    
    // Show notification
    alert(`Payment created successfully for ${studentName}.`);
    
    // Refresh the display and update totals
    applyAllFilters();
}
