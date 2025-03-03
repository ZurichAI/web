// Display costs in the table
function displayCosts(costsToDisplay) {
    // Clear table
    const costsTableBody = document.getElementById('costs-table-body');
    costsTableBody.innerHTML = '';
    
    // Add costs to table
    costsToDisplay.forEach(cost => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', cost.id);
        
        // Format date for display
        const formattedDate = formatDate(cost.date);
        
        // Check if cost has notes
        const hasNotes = cost.notes && cost.notes.length > 0;
        const notesIcon = hasNotes ? '&#128488;' : '';
        
        // Make the comment cell clickable if it has notes
        const commentCellStyle = hasNotes 
            ? 'text-align: center; font-size: 1.2em; cursor: pointer;' 
            : 'text-align: center; font-size: 1.2em;';
        
        row.innerHTML = `
            <td><input type="checkbox" class="cost-row-select" data-id="${cost.id}"></td>
            <td>${formattedDate}</td>
            <td>${cost.purpose}</td>
            <td>${cost.studentName}</td>
            <td>${cost.amount}</td>
            <td style="${commentCellStyle}" title="${hasNotes ? 'Click to view comments' : 'No comments'}" data-id="${cost.id}">${notesIcon}</td>
        `;
        
        costsTableBody.appendChild(row);
    });
    
    // Add event listeners to row checkboxes
    document.querySelectorAll('.cost-row-select').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCostRows);
    });
    // Add click event listeners to rows for selection
    document.querySelectorAll('#costs-table tbody tr').forEach(row => {
        row.addEventListener('click', function(event) {
            // Skip if clicking on the comment cell with notes (it has its own click handler)
            if (event.target.hasAttribute('data-id') && 
                event.target.style.cursor === 'pointer') {
                return;
            }
            
            // Skip if clicking on the checkbox itself (it has its own change handler)
            if (event.target.classList.contains('cost-row-select')) {
                return;
            }
            
            // Find the checkbox in this row
            const checkbox = this.querySelector('.cost-row-select');
            if (checkbox) {
                // Toggle the checkbox
                checkbox.checked = !checkbox.checked;
                
                // Update selected rows
                updateSelectedCostRows();
            }
        });
    });
    
    // Add event listeners to comment cells with notes
    document.querySelectorAll('#costs-table-body td[data-id][style*="cursor: pointer"]').forEach(cell => {
        const costId = cell.getAttribute('data-id');
        cell.addEventListener('click', () => {
            openViewCommentsDialog(costId);
        });
    });
}

// Display payments in the table
function displayPayments(paymentsToDisplay) {
    // Clear table
    const paymentsTableBody = document.getElementById('payments-table-body');
    paymentsTableBody.innerHTML = '';
    
    // Add payments to table
    paymentsToDisplay.forEach(payment => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', payment.id);
        
        // Format date for display
        const formattedDate = formatDate(payment.date);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${payment.purpose}</td>
            <td>${payment.studentName}</td>
            <td>${payment.amount}</td>
        `;
        
        paymentsTableBody.appendChild(row);
    });
    
    // Add click event listeners to rows for selection
    document.querySelectorAll('#payments-table tbody tr').forEach(row => {
        row.addEventListener('click', function(event) {
            // Toggle selected class
            this.classList.toggle('selected-row');
            
            // Update selected payment rows
            updateSelectedPaymentRows();
        });
    });
}

// Update selected cost rows
function updateSelectedCostRows() {
    // Clear the selected rows array
    selectedCostRows = [];
    
    // Remove selected-row class from all rows
    document.querySelectorAll('#costs-table tbody tr').forEach(row => {
        row.classList.remove('selected-row');
    });
    
    // Get the checked checkboxes
    document.querySelectorAll('.cost-row-select:checked').forEach(checkbox => {
        const costId = checkbox.getAttribute('data-id');
        selectedCostRows.push(costId);
        
        // Add selected-row class to the selected row
        const row = checkbox.closest('tr');
        if (row) {
            row.classList.add('selected-row');
        }
    });
    
    // Update button states
    updateButtonStates();
}

// Update selected payment rows
function updateSelectedPaymentRows() {
    // Clear the selected rows array
    selectedPaymentRows = [];
    
    // Get the selected rows
    document.querySelectorAll('#payments-table tbody tr.selected-row').forEach(row => {
        const paymentId = row.getAttribute('data-id');
        selectedPaymentRows.push(paymentId);
    });
    
    // Update button states
    updateButtonStates();
}

// Update button states based on selection
function updateButtonStates() {
    const createCommentBtn = document.getElementById('create-comment-btn');
    const savePaymentBtn = document.getElementById('save-payment-btn');
    
    // Enable/disable create comment button based on cost selection
    createCommentBtn.disabled = selectedCostRows.length !== 1;
    
    // Enable/disable save payment button based on selection
    savePaymentBtn.disabled = (selectedCostRows.length !== 1 && selectedPaymentRows.length !== 1);
}

// Sort costs by field
function sortCosts(field) {
    // Toggle sort direction if same field is clicked
    if (costsSort.field === field) {
        costsSort.direction = costsSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        costsSort.field = field;
        costsSort.direction = 'asc';
    }
    
    // Sort costs
    visibleCosts.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Handle special cases for sorting
        if (field === 'date') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        } else if (field === 'amount') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        } else if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        // Compare values
        if (valueA < valueB) {
            return costsSort.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return costsSort.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // Display sorted costs
    displayCosts(visibleCosts);
    
    // Update table headers
    const tableHeaders = document.querySelectorAll('#costs-table th[data-sort]');
    tableHeaders.forEach(header => {
        const headerField = header.getAttribute('data-sort');
        if (headerField === field) {
            header.textContent = `${header.textContent.replace(' ▲', '').replace(' ▼', '')} ${costsSort.direction === 'asc' ? '▲' : '▼'}`;
        } else {
            header.textContent = header.textContent.replace(' ▲', '').replace(' ▼', '');
        }
    });
}

// Sort payments by field
function sortPayments(field) {
    // Toggle sort direction if same field is clicked
    if (paymentsSort.field === field) {
        paymentsSort.direction = paymentsSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        paymentsSort.field = field;
        paymentsSort.direction = 'asc';
    }
    
    // Sort payments
    visiblePayments.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Handle special cases for sorting
        if (field === 'date') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        } else if (field === 'amount') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        } else if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        // Compare values
        if (valueA < valueB) {
            return paymentsSort.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return paymentsSort.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // Display sorted payments
    displayPayments(visiblePayments);
    
    // Update table headers
    const tableHeaders = document.querySelectorAll('#payments-table th[data-sort]');
    tableHeaders.forEach(header => {
        const headerField = header.getAttribute('data-sort');
        if (headerField === field) {
            header.textContent = `${header.textContent.replace(' ▲', '').replace(' ▼', '')} ${paymentsSort.direction === 'asc' ? '▲' : '▼'}`;
        } else {
            header.textContent = header.textContent.replace(' ▲', '').replace(' ▼', '');
        }
    });
}

// Add student to cost table
function addStudentToCostTable() {
    // Create a dropdown with all students
    const studentsDropdown = document.createElement('select');
    studentsDropdown.className = 'dialog-input';
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select a student';
    studentsDropdown.appendChild(emptyOption);
    
    // Add all students to the dropdown
    studentNames.forEach(name => {
        const student = students.find(s => s.name === name);
        if (student) {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = name;
            studentsDropdown.appendChild(option);
        }
    });
    
    // Create a new row for the students table
    const studentsTable = document.getElementById('cost-students-table-body');
    const newRow = document.createElement('tr');
    
    // Create cells for the row
    const nameCell = document.createElement('td');
    nameCell.appendChild(studentsDropdown);
    
    const groupCell = document.createElement('td');
    groupCell.textContent = '';
    
    const actionCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'btn btn-danger';
    removeButton.addEventListener('click', () => {
        newRow.remove();
        validateCostForm();
    });
    actionCell.appendChild(removeButton);
    
    // Add cells to the row
    newRow.appendChild(nameCell);
    newRow.appendChild(groupCell);
    newRow.appendChild(actionCell);
    
    // Add row to the table
    studentsTable.appendChild(newRow);
    
    // Add event listener to the dropdown to update the group cell
    studentsDropdown.addEventListener('change', () => {
        const selectedStudentId = studentsDropdown.value;
        if (selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) {
                groupCell.textContent = student.group;
                newRow.setAttribute('data-student-id', student.id);
            }
        } else {
            groupCell.textContent = '';
            newRow.removeAttribute('data-student-id');
        }
        validateCostForm();
    });
    
    // Validate form to enable/disable save buttons
    validateCostForm();
}
