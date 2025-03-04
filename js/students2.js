        // Update filter counts based on current filtered students
        function updateFilterCounts(filteredStudents) {
            // Get current filter states
            const activeFilter = document.querySelector('input[name="active-filter"]:checked').value;
            const selectedInstructors = Array.from(document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors):checked')).map(checkbox => checkbox.value);
            const selectedGroups = Array.from(document.querySelectorAll('.group-checkbox:not(#select-all-groups):checked')).map(checkbox => checkbox.value);
            
            // Update instructor counts
            instructors.forEach(instructor => {
                // For instructor counts, we need to apply group and active filters only
                const instructorStudents = students.filter(student => {
                    // Active filter
                    const matchesActive = 
                        activeFilter === 'all' || 
                        (activeFilter === 'active' && student.active === true) ||
                        (activeFilter === 'non-active' && student.active !== true);
                    
                    // Group filter
                    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(student.group);
                    
                    return student.instructor === instructor && matchesActive && matchesGroup;
                });
                
                // Find the count cell for this instructor
                const instructorRow = document.querySelector(`#instructor-${instructor.replace(/\s+/g, '-')}`).closest('tr');
                if (instructorRow) {
                    const countCell = instructorRow.cells[2];
                    countCell.textContent = instructorStudents.length;
                    
                    // Hide row if count is 0, regardless of checkbox state
                    const checkbox = instructorRow.cells[0].querySelector('input');
                    if (instructorStudents.length === 0) {
                        instructorRow.style.display = 'none';
                        checkbox.disabled = true;
                    } else {
                        instructorRow.style.display = '';
                        checkbox.disabled = false;
                    }
                }
            });
            
            // Update "Select all" checkbox for instructors
            updateSelectAllCheckbox('instructor');
            
            // Update group counts
            groups.forEach(group => {
                // For group counts, we need to apply instructor and active filters only
                const groupStudents = students.filter(student => {
                    // Active filter
                    const matchesActive = 
                        activeFilter === 'all' || 
                        (activeFilter === 'active' && student.active === true) ||
                        (activeFilter === 'non-active' && student.active !== true);
                    
                    // Instructor filter
                    const matchesInstructor = selectedInstructors.length === 0 || selectedInstructors.includes(student.instructor);
                    
                    return student.group === group && matchesActive && matchesInstructor;
                });
                
                // Find the count cell for this group
                const groupRow = document.querySelector(`#group-${group.replace(/\s+/g, '-')}`).closest('tr');
                if (groupRow) {
                    const countCell = groupRow.cells[2];
                    countCell.textContent = groupStudents.length;
                    
                    // Hide row if count is 0, regardless of checkbox state
                    const checkbox = groupRow.cells[0].querySelector('input');
                    if (groupStudents.length === 0) {
                        groupRow.style.display = 'none';
                        checkbox.disabled = true;
                    } else {
                        groupRow.style.display = '';
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
                    .filter(checkbox => checkbox.closest('tr').style.display !== 'none');
                
                const allChecked = visibleCheckboxes.length > 0 && 
                    visibleCheckboxes.every(checkbox => checkbox.checked);
                
                document.getElementById('select-all-instructors').checked = allChecked;
            } else if (type === 'group') {
                const visibleCheckboxes = Array.from(document.querySelectorAll('.group-checkbox:not(#select-all-groups)'))
                    .filter(checkbox => checkbox.closest('tr').style.display !== 'none');
                
                const allChecked = visibleCheckboxes.length > 0 && 
                    visibleCheckboxes.every(checkbox => checkbox.checked);
                
                document.getElementById('select-all-groups').checked = allChecked;
            }
        }
        
        // Open edit student dialog
        function openEditStudentDialog() {
            if (selectedRows.length !== 1) {
                return; // Only proceed if exactly one student is selected
            }
            
            const studentId = selectedRows[0];
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                return;
            }
            
            // Populate form fields with student data
            document.getElementById('edit-student-id').value = student.id;
            document.getElementById('edit-student-name').value = student.name;
            document.getElementById('edit-student-group').value = student.group;
            
            // Format dates for input fields (YYYY-MM-DD)
            const formatDateForInput = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };
            
            document.getElementById('edit-student-birthday').value = formatDateForInput(student.birthday);
            document.getElementById('edit-student-start-date').value = formatDateForInput(student.startDate);
            
            // Populate instructor dropdown
            const instructorSelect = document.getElementById('edit-student-instructor');
            instructorSelect.innerHTML = '';
            
            // Add all unique instructors from students data
            instructors.forEach(instructor => {
                const option = document.createElement('option');
                option.value = instructor;
                option.textContent = instructor;
                option.selected = instructor === student.instructor;
                instructorSelect.appendChild(option);
            });
            
            // Set active checkbox
            document.getElementById('edit-student-active').checked = student.active;
            
            // Show dialog
            document.getElementById('edit-student-dialog').style.display = 'flex';
        }
        
        // Close edit student dialog
        function closeEditStudentDialog() {
            document.getElementById('edit-student-dialog').style.display = 'none';
        }
        
        // Open confirm edit dialog
        function openConfirmEditDialog() {
            // Get form values
            const id = document.getElementById('edit-student-id').value;
            const name = document.getElementById('edit-student-name').value;
            const group = document.getElementById('edit-student-group').value;
            const birthday = document.getElementById('edit-student-birthday').value;
            const instructor = document.getElementById('edit-student-instructor').value;
            const startDate = document.getElementById('edit-student-start-date').value;
            const active = document.getElementById('edit-student-active').checked;
            
            // Validate form
            if (!name || !group || !birthday || !instructor || !startDate) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Format dates for display
            const formatDateForDisplay = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString();
            };
            
            // Display confirmation details
            const confirmationDetails = document.getElementById('edit-confirmation-details');
            confirmationDetails.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <tr>
                        <td><strong>ID:</strong></td>
                        <td>${id}</td>
                    </tr>
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><strong>Group:</strong></td>
                        <td>${group}</td>
                    </tr>
                    <tr>
                        <td><strong>Birthday:</strong></td>
                        <td>${formatDateForDisplay(birthday)}</td>
                    </tr>
                    <tr>
                        <td><strong>Instructor:</strong></td>
                        <td>${instructor}</td>
                    </tr>
                    <tr>
                        <td><strong>Start Date:</strong></td>
                        <td>${formatDateForDisplay(startDate)}</td>
                    </tr>
                    <tr>
                        <td><strong>Active:</strong></td>
                        <td>${active ? 'Yes' : 'No'}</td>
                    </tr>
                </table>
            `;
            
            // Hide edit dialog and show confirm dialog
            document.getElementById('edit-student-dialog').style.display = 'none';
            document.getElementById('confirm-edit-dialog').style.display = 'flex';
        }
        
        // Close confirm edit dialog
        function closeConfirmEditDialog() {
            document.getElementById('confirm-edit-dialog').style.display = 'none';
            document.getElementById('edit-student-dialog').style.display = 'flex';
        }
        
        // Save student changes to Airtable
        async function saveStudentChanges() {
            // Get form values
            const id = document.getElementById('edit-student-id').value;
            const name = document.getElementById('edit-student-name').value;
            const group = document.getElementById('edit-student-group').value;
            const birthday = document.getElementById('edit-student-birthday').value;
            const instructor = document.getElementById('edit-student-instructor').value;
            const startDate = document.getElementById('edit-student-start-date').value;
            const active = document.getElementById('edit-student-active').checked;
            
            try {
                // Prepare record data
                const recordData = {
                    fields: {
                        Name: name,
                        Group: group,
                        Birthday: birthday,
                        Instructor: instructor,
                        "Start Date": startDate,
                        Active: active
                    }
                };
                
                // Send PATCH request to Airtable
                const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.students}/${id}`;
                
                const response = await fetch(airtableApiUrl, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${config.airtable.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recordData)
                });
                
                if (!response.ok) {
                    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
                }
                
                // Close dialogs
                document.getElementById('confirm-edit-dialog').style.display = 'none';
                
                // Show notification
                alert(`Student ${name} updated successfully`);
                
                // Refresh students data
                fetchStudents();
                
            } catch (error) {
                console.error('Error updating student:', error);
                alert('Error updating student. Please try again.');
            }
        }
        
        // Open delete options dialog
        function openDeleteOptionsDialog() {
            if (selectedRows.length !== 1) {
                return; // Only proceed if exactly one student is selected
            }
            
            const studentId = selectedRows[0];
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                return;
            }
            
            // Format dates for display
            const formatDateForDisplay = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString();
            };
            
            // Display student details
            const deleteStudentDetails = document.getElementById('delete-student-details');
            deleteStudentDetails.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <tr>
                        <td><strong>ID:</strong></td>
                        <td>${student.id}</td>
                    </tr>
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${student.name}</td>
                    </tr>
                    <tr>
                        <td><strong>Group:</strong></td>
                        <td>${student.group}</td>
                    </tr>
                    <tr>
                        <td><strong>Birthday:</strong></td>
                        <td>${formatDateForDisplay(student.birthday)}</td>
                    </tr>
                    <tr>
                        <td><strong>Instructor:</strong></td>
                        <td>${student.instructor}</td>
                    </tr>
                    <tr>
                        <td><strong>Start Date:</strong></td>
                        <td>${formatDateForDisplay(student.startDate)}</td>
                    </tr>
                    <tr>
                        <td><strong>Active:</strong></td>
                        <td>${student.active ? 'Yes' : 'No'}</td>
                    </tr>
                </table>
            `;
            
            // Show dialog
            document.getElementById('delete-options-dialog').style.display = 'flex';
        }
        
        // Close delete options dialog
        function closeDeleteOptionsDialog() {
            document.getElementById('delete-options-dialog').style.display = 'none';
        }
        
        // Make student inactive
        async function makeStudentInactive() {
            if (selectedRows.length !== 1) {
                return; // Only proceed if exactly one student is selected
            }
            
            const studentId = selectedRows[0];
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                return;
            }
            
            try {
                // Prepare record data
                const recordData = {
                    fields: {
                        Active: false
                    }
                };
                
                // Send PATCH request to Airtable
                const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.students}/${studentId}`;
                
                const response = await fetch(airtableApiUrl, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${config.airtable.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recordData)
                });
                
                if (!response.ok) {
                    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
                }
                
                // Close dialog
                closeDeleteOptionsDialog();
                
                // Show notification
                alert(`Student ${student.name} has been made inactive`);
                
                // Refresh students data
                fetchStudents();
                
            } catch (error) {
                console.error('Error updating student:', error);
                alert('Error updating student. Please try again.');
            }
        }
        
        // Open confirm delete dialog
        function openConfirmDeleteDialog() {
            if (selectedRows.length !== 1) {
                return; // Only proceed if exactly one student is selected
            }
            
            const studentId = selectedRows[0];
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                return;
            }
            
            // Format dates for display
            const formatDateForDisplay = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString();
            };
            
            // Display student details
            const confirmDeleteDetails = document.getElementById('confirm-delete-details');
            confirmDeleteDetails.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <tr>
                        <td><strong>ID:</strong></td>
                        <td>${student.id}</td>
                    </tr>
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${student.name}</td>
                    </tr>
                    <tr>
                        <td><strong>Group:</strong></td>
                        <td>${student.group}</td>
                    </tr>
                    <tr>
                        <td><strong>Birthday:</strong></td>
                        <td>${formatDateForDisplay(student.birthday)}</td>
                    </tr>
                    <tr>
                        <td><strong>Instructor:</strong></td>
                        <td>${student.instructor}</td>
                    </tr>
                    <tr>
                        <td><strong>Start Date:</strong></td>
                        <td>${formatDateForDisplay(student.startDate)}</td>
                    </tr>
                    <tr>
                        <td><strong>Active:</strong></td>
                        <td>${student.active ? 'Yes' : 'No'}</td>
                    </tr>
                </table>
            `;
            
            // Hide delete options dialog and show confirm delete dialog
            document.getElementById('delete-options-dialog').style.display = 'none';
            document.getElementById('confirm-delete-dialog').style.display = 'flex';
        }
        
        // Close confirm delete dialog
        function closeConfirmDeleteDialog() {
            document.getElementById('confirm-delete-dialog').style.display = 'none';
            document.getElementById('delete-options-dialog').style.display = 'flex';
        }
        
        // Delete student from Airtable
        async function deleteStudent() {
            if (selectedRows.length !== 1) {
                return; // Only proceed if exactly one student is selected
            }
            
            const studentId = selectedRows[0];
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                return;
            }
            
            try {
                // Send DELETE request to Airtable
                const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.students}/${studentId}`;
                
                const response = await fetch(airtableApiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${config.airtable.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
                }
                
                // Close dialogs
                document.getElementById('confirm-delete-dialog').style.display = 'none';
                document.getElementById('delete-options-dialog').style.display = 'none';
                
                // Show notification
                alert(`Student ${student.name} has been permanently deleted`);
                
                // Refresh students data
                fetchStudents();
                
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Error deleting student. Please try again.');
            }
        }
        
        // Open create student dialog
        function openCreateStudentDialog() {
            // Clear form fields
            document.getElementById('create-student-name').value = '';
            document.getElementById('create-student-group').value = '';
            document.getElementById('create-student-birthday').value = '';
            
            // Set default values
            // Set current date for start date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('create-student-start-date').value = today;
            
            // Set active checkbox to true by default
            document.getElementById('create-student-active').checked = true;
            
            // Populate instructor dropdown
            const instructorSelect = document.getElementById('create-student-instructor');
            instructorSelect.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Select an instructor';
            instructorSelect.appendChild(emptyOption);
            
            // Add all unique instructors from students data
            instructors.forEach(instructor => {
                const option = document.createElement('option');
                option.value = instructor;
                option.textContent = instructor;
                instructorSelect.appendChild(option);
            });
            
            // Disable save button initially
            document.getElementById('save-create-btn').disabled = true;
            
            // Show dialog
            document.getElementById('create-student-dialog').style.display = 'flex';
        }
        
        // Close create student dialog
        function closeCreateStudentDialog() {
            document.getElementById('create-student-dialog').style.display = 'none';
        }
        
        // Validate create student form
        function validateCreateStudentForm() {
            const name = document.getElementById('create-student-name').value.trim();
            const group = document.getElementById('create-student-group').value.trim();
            const instructor = document.getElementById('create-student-instructor').value;
            const startDate = document.getElementById('create-student-start-date').value;
            
            // Enable save button only if all required fields are filled
            const saveCreateBtn = document.getElementById('save-create-btn');
            saveCreateBtn.disabled = !(name && group && instructor && startDate);
        }
        
        // Open confirm create dialog
        function openConfirmCreateDialog() {
            // Get form values
            const name = document.getElementById('create-student-name').value.trim();
            const group = document.getElementById('create-student-group').value.trim();
            const birthday = document.getElementById('create-student-birthday').value;
            const instructor = document.getElementById('create-student-instructor').value;
            const startDate = document.getElementById('create-student-start-date').value;
            const active = document.getElementById('create-student-active').checked;
            
            // Validate form
            if (!name || !group || !instructor || !startDate) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Format dates for display
            const formatDateForDisplay = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString();
            };
            
            // Display confirmation details
            const confirmationDetails = document.getElementById('create-confirmation-details');
            confirmationDetails.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><strong>Group:</strong></td>
                        <td>${group}</td>
                    </tr>
                    <tr>
                        <td><strong>Birthday:</strong></td>
                        <td>${formatDateForDisplay(birthday)}</td>
                    </tr>
                    <tr>
                        <td><strong>Instructor:</strong></td>
                        <td>${instructor}</td>
                    </tr>
                    <tr>
                        <td><strong>Start Date:</strong></td>
                        <td>${formatDateForDisplay(startDate)}</td>
                    </tr>
                    <tr>
                        <td><strong>Active:</strong></td>
                        <td>${active ? 'Yes' : 'No'}</td>
                    </tr>
                </table>
            `;
            
            // Hide create dialog and show confirm dialog
            document.getElementById('create-student-dialog').style.display = 'none';
            document.getElementById('confirm-create-dialog').style.display = 'flex';
        }
        
        // Close confirm create dialog
        function closeConfirmCreateDialog() {
            document.getElementById('confirm-create-dialog').style.display = 'none';
            document.getElementById('create-student-dialog').style.display = 'flex';
        }
        
        // Save new student to Airtable
        async function saveNewStudent() {
            // Get form values
            const name = document.getElementById('create-student-name').value.trim();
            const group = document.getElementById('create-student-group').value.trim();
            const birthday = document.getElementById('create-student-birthday').value;
            const instructor = document.getElementById('create-student-instructor').value;
            const startDate = document.getElementById('create-student-start-date').value;
            const active = document.getElementById('create-student-active').checked;
            
            try {
                // Prepare record data
                const recordData = {
                    fields: {
                        Name: name,
                        Group: group,
                        Birthday: birthday,
                        Instructor: instructor,
                        "Start Date": startDate,
                        Active: active
                    }
                };
                
                // Send POST request to Airtable
                const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.students}`;
                
                const response = await fetch(airtableApiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${config.airtable.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recordData)
                });
                
                if (!response.ok) {
                    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
                }
                
                // Close dialogs
                document.getElementById('confirm-create-dialog').style.display = 'none';
                
                // Show notification
                alert(`Contact ${name} created successfully`);
                
                // Refresh students data
                fetchStudents();
                
            } catch (error) {
                console.error('Error creating student:', error);
                alert('Error creating student. Please try again.');
            }
        }
        
        // Fetch dossier data from Airtable
        async function fetchDossiers() {
            try {
                console.log('GET operation - Sending dossier request...');
                const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.dossiers}`;
                
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
                console.log('GET operation - Dossier response data:', data);
                
                // Format Airtable records to dossier objects
                dossiers = data.records.map(record => ({
                    id: record.id,
                    timestamp: record.fields.Timestamp || '',
                    studentID: record.fields.studentID || '',
                    createdBy: record.fields['Created By'] || '',
                    record: record.fields.Record || ''
                }));
                
                // Sort dossiers by timestamp descending by default
                dossiers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // Update student table to show dossier indicators
                if (students.length > 0) {
                    displayStudents(visibleStudents.length > 0 ? visibleStudents : students);
                }
            } catch (error) {
                console.error('Error fetching dossiers:', error);
                // Show error message
            }
        }
