// Global variables
let students = [];
let instructors = [];
let groups = [];
let costs = [];
let payments = [];
let costsSort = { field: 'date', direction: 'desc' };
let paymentsSort = { field: 'date', direction: 'desc' };
let selectedCostRows = [];
let selectedPaymentRows = [];
let visibleCosts = [];
let visiblePayments = [];
let studentNames = []; // For student name filter

// Helper function to format date as dd.mm.yyyy
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '';
    }
    
    // Format as dd.mm.yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set default date for cost and payment creation
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cost-date').value = today;
    document.getElementById('payment-date').value = today;
    
    // Fetch data
    fetchStudents();
    fetchCosts();
    fetchPayments();
    
    // Initialize event listeners
    initEventListeners();
});

// Initialize event listeners
function initEventListeners() {
    // Search functionality
    const searchStudentInput = document.getElementById('search-student-input');
    searchStudentInput.addEventListener('input', filterByStudent);
    
    const searchPurposeInput = document.getElementById('search-purpose-input');
    searchPurposeInput.addEventListener('input', filterByPurpose);
    
    // Date filter functionality
    const dateFromInput = document.getElementById('date-from');
    dateFromInput.addEventListener('change', filterByDate);
    
    const dateToInput = document.getElementById('date-to');
    dateToInput.addEventListener('change', filterByDate);
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Comment button functionality
    const createCommentBtn = document.getElementById('create-comment-btn');
    createCommentBtn.addEventListener('click', openCommentDialog);
    
    // Create cost button functionality
    const createCostBtn = document.getElementById('create-cost-btn');
    createCostBtn.addEventListener('click', openCreateCostDialog);
    
    // Save payment button functionality
    const savePaymentBtn = document.getElementById('save-payment-btn');
    savePaymentBtn.addEventListener('click', openCreatePaymentDialog);
    
    // Select all students checkbox
    const selectAllStudents = document.getElementById('select-all-students');
    if (selectAllStudents) {
        selectAllStudents.addEventListener('change', () => {
            const checkboxes = document.querySelectorAll('.student-checkbox:not(#select-all-students)');
            checkboxes.forEach(checkbox => {
                if (!checkbox.disabled) {
                    checkbox.checked = selectAllStudents.checked;
                }
            });
            filterByStudentName();
        });
    }
    
    // Select all costs checkbox
    const selectAllCosts = document.getElementById('select-all-costs');
    selectAllCosts.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.cost-row-select:not(#select-all-costs)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCosts.checked;
        });
        updateSelectedCostRows();
    });
    
    // Cost table sorting
    const costTableHeaders = document.querySelectorAll('#costs-table th[data-sort]');
    costTableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-sort');
            sortCosts(field);
        });
    });
    
    // Payment table sorting
    const paymentTableHeaders = document.querySelectorAll('#payments-table th[data-sort]');
    paymentTableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-sort');
            sortPayments(field);
        });
    });
    
    // Active filter radio buttons
    const activeFilterRadios = document.querySelectorAll('input[name="active-filter"]');
    activeFilterRadios.forEach(radio => {
        radio.addEventListener('change', filterByActive);
    });
    
    // Select all instructors checkbox
    const selectAllInstructors = document.getElementById('select-all-instructors');
    selectAllInstructors.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors)');
        checkboxes.forEach(checkbox => {
            if (!checkbox.disabled) {
                checkbox.checked = selectAllInstructors.checked;
            }
        });
        filterByInstructor();
    });
    
    // Select all groups checkbox
    const selectAllGroups = document.getElementById('select-all-groups');
    selectAllGroups.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.group-checkbox:not(#select-all-groups)');
        checkboxes.forEach(checkbox => {
            if (!checkbox.disabled) {
                checkbox.checked = selectAllGroups.checked;
            }
        });
        filterByGroup();
    });
    
    // Comment dialog buttons
    const cancelCommentBtn = document.getElementById('cancel-comment-btn');
    cancelCommentBtn.addEventListener('click', closeCommentDialog);
    
    const saveCommentBtn = document.getElementById('save-comment-btn');
    saveCommentBtn.addEventListener('click', saveComment);
    
    // Comment input validation
    const commentInput = document.getElementById('comment-input');
    commentInput.addEventListener('input', validateCommentInput);
    
    // View comments dialog buttons
    const closeCommentsBtn = document.getElementById('close-comments-btn');
    closeCommentsBtn.addEventListener('click', closeViewCommentsDialog);
    
    const addCommentBtn = document.getElementById('add-comment-btn');
    addCommentBtn.addEventListener('click', () => {
        closeViewCommentsDialog();
        openCommentDialog();
    });
    
    // Cost dialog buttons
    const cancelCostBtn = document.getElementById('cancel-cost-btn');
    cancelCostBtn.addEventListener('click', closeCreateCostDialog);
    
    const saveCostBtn = document.getElementById('save-cost-btn');
    saveCostBtn.addEventListener('click', openConfirmCostDialog);
    
    const saveWithReferencePaymentBtn = document.getElementById('save-with-reference-payment-btn');
    saveWithReferencePaymentBtn.addEventListener('click', openCreatePaymentReferenceDialog);
    
    // Cost form validation
    const costForm = document.getElementById('create-cost-form');
    costForm.addEventListener('input', validateCostForm);
    
    // Add student button
    const addStudentBtn = document.getElementById('add-student-btn');
    addStudentBtn.addEventListener('click', addStudentToCostTable);
    
    // Confirm cost dialog buttons
    const cancelConfirmCostBtn = document.getElementById('cancel-confirm-cost-btn');
    cancelConfirmCostBtn.addEventListener('click', closeConfirmCostDialog);
    
    const saveConfirmCostBtn = document.getElementById('save-confirm-cost-btn');
    saveConfirmCostBtn.addEventListener('click', saveCost);
    
    // Payment reference dialog buttons
    const cancelPaymentRefBtn = document.getElementById('cancel-payment-ref-btn');
    cancelPaymentRefBtn.addEventListener('click', closeCreatePaymentReferenceDialog);
    
    const saveCostAndPaymentBtn = document.getElementById('save-cost-and-payment-btn');
    saveCostAndPaymentBtn.addEventListener('click', openConfirmCostPaymentDialog);
    
    // Confirm cost and payment dialog buttons
    const cancelConfirmCostPaymentBtn = document.getElementById('cancel-confirm-cost-payment-btn');
    cancelConfirmCostPaymentBtn.addEventListener('click', closeConfirmCostPaymentDialog);
    
    const saveConfirmCostPaymentBtn = document.getElementById('save-confirm-cost-payment-btn');
    saveConfirmCostPaymentBtn.addEventListener('click', saveCostAndPayment);
    
    // Payment dialog buttons
    const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
    cancelPaymentBtn.addEventListener('click', closeCreatePaymentDialog);
    
    const savePaymentDialogBtn = document.getElementById('save-payment-dialog-btn');
    savePaymentDialogBtn.addEventListener('click', openConfirmPaymentDialog);
    
    // Payment form validation
    const paymentForm = document.getElementById('create-payment-form');
    paymentForm.addEventListener('input', validatePaymentForm);
    
    // Confirm payment dialog buttons
    const cancelConfirmPaymentBtn = document.getElementById('cancel-confirm-payment-btn');
    cancelConfirmPaymentBtn.addEventListener('click', closeConfirmPaymentDialog);
    
    const saveConfirmPaymentBtn = document.getElementById('save-confirm-payment-btn');
    saveConfirmPaymentBtn.addEventListener('click', savePayment);
}

// Filter functions
function filterByStudent() {
    applyAllFilters();
}

function filterByPurpose() {
    applyAllFilters();
}

function filterByDate() {
    applyAllFilters();
}

function filterByActive() {
    applyAllFilters();
}

function filterByInstructor() {
    applyAllFilters();
}

function filterByGroup() {
    applyAllFilters();
}

function filterByStudentName() {
    applyAllFilters();
}

function applyAllFilters() {
    // Get search terms
    const searchStudentTerm = document.getElementById('search-student-input').value.toLowerCase();
    const searchPurposeTerm = document.getElementById('search-purpose-input').value.toLowerCase();
    
    // Get date filter values
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    // Get active filter value
    const activeFilter = document.querySelector('input[name="active-filter"]:checked').value;
    
    // Get selected instructors
    const selectedInstructors = Array.from(document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors):checked')).map(checkbox => checkbox.value);
    
    // Get selected groups
    const selectedGroups = Array.from(document.querySelectorAll('.group-checkbox:not(#select-all-groups):checked')).map(checkbox => checkbox.value);
    
    // Get selected student names
    const selectedStudentNames = Array.from(document.querySelectorAll('.student-checkbox:not(#select-all-students):checked')).map(checkbox => checkbox.value);
    
    // Filter costs
    const filteredCosts = costs.filter(cost => {
        // Student name filter (for both search and dropdown)
        const matchesStudentName = 
            (!searchStudentTerm || cost.studentName.toLowerCase().includes(searchStudentTerm)) &&
            (selectedStudentNames.length === 0 || selectedStudentNames.includes(cost.studentName));
        
        // Purpose filter
        const matchesPurpose = !searchPurposeTerm || cost.purpose.toLowerCase().includes(searchPurposeTerm);
        
        // Date filter
        const costDate = new Date(cost.date);
        const matchesDateFrom = !dateFrom || costDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || costDate <= new Date(dateTo);
        
        // Active filter
        const student = students.find(s => s.name === cost.studentName);
        const matchesActive = 
            activeFilter === 'all' || 
            (activeFilter === 'active' && student && student.active === true) ||
            (activeFilter === 'non-active' && student && student.active !== true);
        
        // Instructor filter
        const matchesInstructor = selectedInstructors.length === 0 || 
            (student && selectedInstructors.includes(student.instructor));
        
        // Group filter
        const matchesGroup = selectedGroups.length === 0 || 
            (student && selectedGroups.includes(student.group));
        
        return matchesStudentName && matchesPurpose && matchesDateFrom && matchesDateTo && 
               matchesActive && matchesInstructor && matchesGroup;
    });
    
    // Filter payments
    const filteredPayments = payments.filter(payment => {
        // Student name filter (for both search and dropdown)
        const matchesStudentName = 
            (!searchStudentTerm || payment.studentName.toLowerCase().includes(searchStudentTerm)) &&
            (selectedStudentNames.length === 0 || selectedStudentNames.includes(payment.studentName));
        
        // Purpose filter
        const matchesPurpose = !searchPurposeTerm || (payment.purpose && payment.purpose.toLowerCase().includes(searchPurposeTerm));
        
        // Date filter
        const paymentDate = new Date(payment.date);
        const matchesDateFrom = !dateFrom || paymentDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || paymentDate <= new Date(dateTo);
        
        // Active filter
        const student = students.find(s => s.name === payment.studentName);
        const matchesActive = 
            activeFilter === 'all' || 
            (activeFilter === 'active' && student && student.active === true) ||
            (activeFilter === 'non-active' && student && student.active !== true);
        
        // Instructor filter
        const matchesInstructor = selectedInstructors.length === 0 || 
            (student && selectedInstructors.includes(student.instructor));
        
        // Group filter
        const matchesGroup = selectedGroups.length === 0 || 
            (student && selectedGroups.includes(student.group));
        
        return matchesStudentName && matchesPurpose && matchesDateFrom && matchesDateTo && 
               matchesActive && matchesInstructor && matchesGroup;
    });
    
    // Store filtered results
    visibleCosts = filteredCosts;
    visiblePayments = filteredPayments;
    
    // Display filtered results
    displayCosts(filteredCosts);
    displayPayments(filteredPayments);
    
    // Update filter counts
    updateFilterCounts(filteredCosts, filteredPayments);
    
    // Update button states
    updateButtonStates();
}

function clearAllFilters() {
    // Reset search inputs
    document.getElementById('search-student-input').value = '';
    document.getElementById('search-purpose-input').value = '';
    
    // Reset date filters
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    
    // Reset active filter to "Active"
    document.getElementById('active-only').checked = true;
    
    // Reset instructor checkboxes
    document.getElementById('select-all-instructors').checked = true;
    document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors)').forEach(checkbox => {
        checkbox.checked = true;
        checkbox.disabled = false;
    });
    
    // Reset group checkboxes
    document.getElementById('select-all-groups').checked = true;
    document.querySelectorAll('.group-checkbox:not(#select-all-groups)').forEach(checkbox => {
        checkbox.checked = true;
        checkbox.disabled = false;
    });
    
    // Reset student checkboxes if they exist
    const selectAllStudents = document.getElementById('select-all-students');
    if (selectAllStudents) {
        selectAllStudents.checked = true;
        document.querySelectorAll('.student-checkbox:not(#select-all-students)').forEach(checkbox => {
            checkbox.checked = true;
            checkbox.disabled = false;
        });
    }
    
    // Apply filters to update the display
    applyAllFilters();
}

// Dialog functions
function openCommentDialog() {
    if (selectedCostRows.length !== 1) {
        alert('Please select exactly one cost record to add a comment.');
        return;
    }
    
    // Get the selected cost
    const costId = selectedCostRows[0];
    const cost = costs.find(c => c.id === costId);
    
    if (!cost) {
        alert('Selected cost record not found.');
        return;
    }
    
    // Populate the dialog
    document.getElementById('comment-date').value = new Date(cost.date).toLocaleDateString();
    document.getElementById('comment-student').value = cost.studentName;
    document.getElementById('comment-input').value = '';
    
    // Disable save button initially
    document.getElementById('save-comment-btn').disabled = true;
    
    // Show dialog
    document.getElementById('comment-dialog').style.display = 'flex';
}

function closeCommentDialog() {
    document.getElementById('comment-dialog').style.display = 'none';
}

function validateCommentInput() {
    const commentInput = document.getElementById('comment-input');
    const saveCommentBtn = document.getElementById('save-comment-btn');
    
    // Enable save button only if input is not empty
    saveCommentBtn.disabled = commentInput.value.trim() === '';
}

function saveComment() {
    if (selectedCostRows.length !== 1) {
        alert('Please select exactly one cost record to add a comment.');
        return;
    }
    
    const costId = selectedCostRows[0];
    const cost = costs.find(c => c.id === costId);
    console.log('Selected row ${costId}');
    
    if (!cost) {
        alert('Selected cost record not found.');
        return;
    }
    
// Update the cost record with the comment
const commentText = document.getElementById('comment-input').value.trim();

if (commentText === '') {
    alert('Please enter a comment.');
    return;
}

// If there was an existing note, append the new comment to it
if (typeof cost.notes === 'string' && cost.notes.trim() !== '') {
    cost.notes = `${cost.notes}\n\n${commentText}`;
} else {
    // If no existing note, create a new one
    cost.notes = ` ${commentText}`;
}
    
// Send the updated notes to Airtable
const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.cost}/${costId}`;

// Show loading indicator or disable the save button
document.getElementById('save-comment-btn').disabled = true;
document.getElementById('save-comment-btn').textContent = 'Saving...';

// Prepare the data for Airtable
const updateData = {
    fields: {
        Notes: cost.notes
    }
};

// Make the API call to update the record
fetch(airtableApiUrl, {
    method: 'PATCH',
    headers: {
        'Authorization': `Bearer ${config.airtable.apiKey}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
})
.then(response => {
    if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
})
.then(data => {
    console.log('Comment saved successfully:', data);
    
    // Close dialog
    closeCommentDialog();
    
    // Show success notification
    alert(`Comment added to the cost record for ${cost.studentName}`);
    
    // Refresh the display
    applyAllFilters();
})
.catch(error => {
    console.error('Error saving comment:', error);
    alert(`Error saving comment: ${error.message}`);
    
    // Re-enable the save button
    document.getElementById('save-comment-btn').disabled = false;
    document.getElementById('save-comment-btn').textContent = 'Save';
})
.finally(() => {
    // Reset button state if dialog is still open
    if (document.getElementById('comment-dialog').style.display === 'flex') {
        document.getElementById('save-comment-btn').disabled = false;
        document.getElementById('save-comment-btn').textContent = 'Save';
    }
});
    
// Close dialog
closeCommentDialog();
    
// Show notification
alert(`Comment added to the cost record for ${cost.studentName}`);
    
// Refresh the display
applyAllFilters();
}

function openViewCommentsDialog(costId) {
    const cost = costs.find(c => c.id === costId);
    
    if (!cost) {
        alert('Cost record not found.');
        return;
    }
    
    // Update dialog title
    const dialogTitle = document.querySelector('#view-comments-dialog .dialog-title');
    dialogTitle.textContent = `Comments for ${cost.studentName}`;
    
// Display comments in the table
const tableBody = document.getElementById('comments-table-body');
tableBody.innerHTML = '';

// Handle the case where notes is a string
if (typeof cost.notes === 'string' && cost.notes.trim() !== '') {
    // If notes is a non-empty string, create a single comment entry
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formatDate(cost.date)}</td>
        <td>${cost.notes}</td>
        <td>System</td>
    `;
    tableBody.appendChild(row);
} else {
    // If notes is empty or not a string
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="3">No comments available</td>';
    tableBody.appendChild(row);
}
    
    // Store the cost ID for the Add Comment button
    document.getElementById('add-comment-btn').setAttribute('data-cost-id', costId);
    
    // Show dialog
    document.getElementById('view-comments-dialog').style.display = 'flex';
}

function closeViewCommentsDialog() {
    document.getElementById('view-comments-dialog').style.display = 'none';
}

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
    
    // Refresh the display
    applyAllFilters();
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

// Validate cost form
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

// Validate payment form
function validatePaymentForm() {
    const amount = document.getElementById('payment-amount').value.trim();
    const studentSelect = document.getElementById('payment-student');
    const studentSelected = studentSelect.value !== '';
    
    // Enable save button only if required fields are filled
    const savePaymentDialogBtn = document.getElementById('save-payment-dialog-btn');
    savePaymentDialogBtn.disabled = !(amount && studentSelected);
}

// Added functions ==========================================================
// Fetch students data from Airtable
async function fetchStudents() {
    try {
        console.log('GET operation - Sending request for students...');
        const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.students}`;
        
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
        console.log('GET operation - Students response data:', data);
        
        // Format Airtable records to student objects
        students = data.records.map(record => ({
            id: record.id,
            name: record.fields.Name || '',
            group: record.fields.Group || '',
            instructor: record.fields.Instructor || '',
            active: record.fields.Active === true
        }));
        
        // Extract unique student names for the student filter
        studentNames = [...new Set(students.map(student => student.name))].filter(Boolean).sort();
        
        // Extract unique instructors and groups
        extractUniqueValues();
        
        // Populate filter checkboxes
        populateFilterCheckboxes();
    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Error fetching students data. Please try again.');
    }
}

// Fetch costs data from Airtable
async function fetchCosts() {
    try {
        console.log('GET operation - Sending request for costs...');
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
        console.log('GET operation - Costs response data:', data);
        
        // Add this console.log to inspect the raw records
        console.log('Raw cost records from Airtable:', data.records);
        
        // Format Airtable records to cost objects
        costs = data.records.map(record => {
            // Add this console.log to inspect each record's fields
            console.log('Cost record fields:', record.fields);
            
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
               // Add this console.log to inspect the formatted costs array
               console.log('Formatted costs array:', costs); 
        
        // Sort costs by date descending by default
        sortCosts('date');
        
        // Display costs
        displayCosts(costs);
    } catch (error) {
        console.error('Error fetching costs:', error);
        alert('Error fetching costs data. Please try again.');
    }
}

// Fetch payments data from Airtable
async function fetchPayments() {
    try {
        console.log('GET operation - Sending request for payments...');
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
        console.log('GET operation - Payments response data:', data);
        
        // Add this console.log to inspect the raw records
        console.log('Raw payment records from Airtable:', data.records);


        // Format Airtable records to payment objects
        payments = data.records.map(record => {
            // Add this console.log to inspect each record's fields
            console.log('Payment record fields:', record.fields);
            
            return {
                id: record.id,
                date: record.fields.CreatedDateTime || '',
                purpose: record.fields['Purpose of payment'] || '',
                studentID: record.fields.StudentID || '',
                studentName: record.fields['Student Name']  || '',
                amount: record.fields['Amount CHF']  || 0
            };
        });

        // Add this console.log to inspect the formatted payments array
        console.log('Formatted payments array:', payments);
        
        // Sort payments by date descending by default
        sortPayments('date');
        
        // Display payments
        displayPayments(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        alert('Error fetching payments data. Please try again.');
    }
}

// Extract unique instructors and groups from students data
function extractUniqueValues() {
    instructors = [...new Set(students.map(student => student.instructor))].filter(Boolean).sort();
    groups = [...new Set(students.map(student => student.group))].filter(Boolean).sort();
}

// Populate filter checkboxes
function populateFilterCheckboxes() {
    // Count students per instructor
    const instructorCounts = {};
    instructors.forEach(instructor => {
        instructorCounts[instructor] = students.filter(student => student.instructor === instructor).length;
    });
    
    // Sort instructors by count descending
    const sortedInstructors = [...instructors].sort((a, b) => instructorCounts[b] - instructorCounts[a]);
    
    // Populate instructor table
    const instructorCheckboxes = document.getElementById('instructor-checkboxes');
    instructorCheckboxes.innerHTML = `
        <table class="filter-table">
            <thead>
                <tr>
                    <th>Select</th>
                    <th>Instructor</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody id="instructor-table-body">
            </tbody>
        </table>
    `;
    
    const instructorTableBody = document.getElementById('instructor-table-body');
    
    sortedInstructors.forEach(instructor => {
        const row = document.createElement('tr');
        
        // Checkbox cell
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `instructor-${instructor.replace(/\s+/g, '-')}`;
        checkbox.className = 'instructor-checkbox';
        checkbox.value = instructor;
        checkbox.checked = true;
        checkbox.addEventListener('change', () => {
            // Update "Select all" checkbox
            const allChecked = document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors):checked').length === instructors.length;
            document.getElementById('select-all-instructors').checked = allChecked;
            
            filterByInstructor();
        });
        checkboxCell.appendChild(checkbox);
        
        // Instructor name cell
        const nameCell = document.createElement('td');
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = instructor;
        nameCell.appendChild(label);
        
        // Count cell
        const countCell = document.createElement('td');
        countCell.textContent = instructorCounts[instructor];
        
        // Add cells to row
        row.appendChild(checkboxCell);
        row.appendChild(nameCell);
        row.appendChild(countCell);
        
        // Add row to table
        instructorTableBody.appendChild(row);
    });
    
    // Count students per group
    const groupCounts = {};
    groups.forEach(group => {
        groupCounts[group] = students.filter(student => student.group === group).length;
    });
    
    // Sort groups by count descending
    const sortedGroups = [...groups].sort((a, b) => groupCounts[b] - groupCounts[a]);
    
    // Populate group table
    const groupCheckboxes = document.getElementById('group-checkboxes');
    groupCheckboxes.innerHTML = `
        <table class="filter-table">
            <thead>
                <tr>
                    <th>Select</th>
                    <th>Group</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody id="group-table-body">
            </tbody>
        </table>
    `;
    
    const groupTableBody = document.getElementById('group-table-body');
    
    sortedGroups.forEach(group => {
        const row = document.createElement('tr');
        
        // Checkbox cell
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `group-${group.replace(/\s+/g, '-')}`;
        checkbox.className = 'group-checkbox';
        checkbox.value = group;
        checkbox.checked = true;
        checkbox.addEventListener('change', () => {
            // Update "Select all" checkbox
            const allChecked = document.querySelectorAll('.group-checkbox:not(#select-all-groups):checked').length === groups.length;
            document.getElementById('select-all-groups').checked = allChecked;
            
            filterByGroup();
        });
        checkboxCell.appendChild(checkbox);
        
        // Group name cell
        const nameCell = document.createElement('td');
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = group;
        nameCell.appendChild(label);
        
        // Count cell
        const countCell = document.createElement('td');
        countCell.textContent = groupCounts[group];
        
        // Add cells to row
        row.appendChild(checkboxCell);
        row.appendChild(nameCell);
        row.appendChild(countCell);
        
        // Add row to table
        groupTableBody.appendChild(row);
    });
}

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

// Update filter counts
function updateFilterCounts(filteredCosts, filteredPayments) {
    // Get current filter states
    const activeFilter = document.querySelector('input[name="active-filter"]:checked').value;
    const selectedInstructors = Array.from(document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors):checked')).map(checkbox => checkbox.value);
    const selectedGroups = Array.from(document.querySelectorAll('.group-checkbox:not(#select-all-groups):checked')).map(checkbox => checkbox.value);
    const selectedStudentNames = Array.from(document.querySelectorAll('.student-checkbox:not(#select-all-students):checked')).map(checkbox => checkbox.value);
    
    // Update instructor counts
    instructors.forEach(instructor => {
        // For instructor counts, we need to apply group, student name, and active filters only
        const instructorStudents = students.filter(student => {
            // Active filter
            const matchesActive = 
                activeFilter === 'all' || 
                (activeFilter === 'active' && student.active === true) ||
                (activeFilter === 'non-active' && student.active !== true);
            
            // Group filter
            const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(student.group);
            
            // Student name filter
            const matchesStudentName = selectedStudentNames.length === 0 || selectedStudentNames.includes(student.name);
            
            return student.instructor === instructor && matchesActive && matchesGroup && matchesStudentName;
        });
        
        // Find the count cell for this instructor
        const instructorRow = document.querySelector(`#instructor-${instructor.replace(/\s+/g, '-')}`);
        if (instructorRow) {
            const countCell = instructorRow.closest('tr').cells[2];
            countCell.textContent = instructorStudents.length;
            
            // Hide row if count is 0, regardless of checkbox state
            const checkbox = instructorRow.closest('tr').cells[0].querySelector('input');
            if (instructorStudents.length === 0) {
                instructorRow.closest('tr').style.display = 'none';
                checkbox.disabled = true;
            } else {
                instructorRow.closest('tr').style.display = '';
                checkbox.disabled = false;
            }
        }
    });
    
    // Update "Select all" checkbox for instructors
    updateSelectAllCheckbox('instructor');
    
    // Update group counts
    groups.forEach(group => {
        // For group counts, we need to apply instructor, student name, and active filters only
        const groupStudents = students.filter(student => {
            // Active filter
            const matchesActive = 
                activeFilter === 'all' || 
                (activeFilter === 'active' && student.active === true) ||
                (activeFilter === 'non-active' && student.active !== true);
            
            // Instructor filter
            const matchesInstructor = selectedInstructors.length === 0 || selectedInstructors.includes(student.instructor);
            
            // Student name filter
            const matchesStudentName = selectedStudentNames.length === 0 || selectedStudentNames.includes(student.name);
            
            return student.group === group && matchesActive && matchesInstructor && matchesStudentName;
        });
        
        // Find the count cell for this group
        const groupRow = document.querySelector(`#group-${group.replace(/\s+/g, '-')}`);
        if (groupRow) {
            const countCell = groupRow.closest('tr').cells[2];
            countCell.textContent = groupStudents.length;
            
            // Hide row if count is 0, regardless of checkbox state
            const checkbox = groupRow.closest('tr').cells[0].querySelector('input');
            if (groupStudents.length === 0) {
                groupRow.closest('tr').style.display = 'none';
                checkbox.disabled = true;
            } else {
                groupRow.closest('tr').style.display = '';
                checkbox.disabled = false;
            }
        }
    });
    
    // Update "Select all" checkbox for groups
    updateSelectAllCheckbox('group');
}

// Update "Select all" checkbox state based on visible checkboxes
function updateSelectAllCheckbox(type) {
    if (type === 'instructor') {
        const visibleCheckboxes = Array.from(document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors)'))
            .filter(checkbox => checkbox.closest('tr').style.display !== 'none' && !checkbox.disabled);
        
        const allChecked = visibleCheckboxes.length > 0 && 
            visibleCheckboxes.every(checkbox => checkbox.checked);
        
        document.getElementById('select-all-instructors').checked = allChecked;
    } else if (type === 'group') {
        const visibleCheckboxes = Array.from(document.querySelectorAll('.group-checkbox:not(#select-all-groups)'))
            .filter(checkbox => checkbox.closest('tr').style.display !== 'none' && !checkbox.disabled);
        
        const allChecked = visibleCheckboxes.length > 0 && 
            visibleCheckboxes.every(checkbox => checkbox.checked);
        
        document.getElementById('select-all-groups').checked = allChecked;
    } else if (type === 'student') {
        const visibleCheckboxes = Array.from(document.querySelectorAll('.student-checkbox:not(#select-all-students)'))
            .filter(checkbox => checkbox.closest('tr').style.display !== 'none' && !checkbox.disabled);
        
        const allChecked = visibleCheckboxes.length > 0 && 
            visibleCheckboxes.every(checkbox => checkbox.checked);
        
        document.getElementById('select-all-students').checked = allChecked;
    }
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
