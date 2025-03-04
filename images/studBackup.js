        // Global variables
        let students = [];
        let instructors = [];
        let groups = [];
        let dossiers = [];
        let currentSort = { field: 'name', direction: 'asc' };
        let dossierSort = { field: 'timestamp', direction: 'desc' };
        let selectedRows = [];
        let visibleStudents = []; // Store currently visible students after filtering
        
        // Initialize the page
        document.addEventListener('DOMContentLoaded', () => {
            // Fetch students data
            fetchStudents();
            
            // Fetch dossier data
            fetchDossiers();
            
            // Initialize event listeners
            initEventListeners();
        });
        
        // Initialize event listeners
        function initEventListeners() {
            // Search functionality
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', filterStudents);
            
            // Comment button functionality
            const createCommentBtn = document.getElementById('create-comment-btn');
            createCommentBtn.addEventListener('click', openCommentDialog);
            
            // Edit contact button functionality
            const editContactBtn = document.getElementById('edit-contact-btn');
            editContactBtn.addEventListener('click', openEditStudentDialog);
            
            // Create contact button functionality
            const createContactBtn = document.getElementById('create-contact-btn');
            createContactBtn.addEventListener('click', openCreateStudentDialog);
            
            // Delete contact button functionality
            const deleteContactBtn = document.getElementById('delete-contact-btn');
            deleteContactBtn.addEventListener('click', openDeleteOptionsDialog);
            
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
                // Close the view comments dialog
                closeViewCommentsDialog();
                // Open the add comment dialog
                openCommentDialog();
            });
            
            // Edit student dialog buttons
            const cancelEditBtn = document.getElementById('cancel-edit-btn');
            cancelEditBtn.addEventListener('click', closeEditStudentDialog);
            
            const saveEditBtn = document.getElementById('save-edit-btn');
            saveEditBtn.addEventListener('click', openConfirmEditDialog);
            
            // Confirm edit dialog buttons
            const cancelConfirmEditBtn = document.getElementById('cancel-confirm-edit-btn');
            cancelConfirmEditBtn.addEventListener('click', closeConfirmEditDialog);
            
            const saveConfirmEditBtn = document.getElementById('save-confirm-edit-btn');
            saveConfirmEditBtn.addEventListener('click', saveStudentChanges);
            
            // Delete options dialog buttons
            const makeInactiveBtn = document.getElementById('make-inactive-btn');
            makeInactiveBtn.addEventListener('click', makeStudentInactive);
            
            const deleteStudentBtn = document.getElementById('delete-student-btn');
            deleteStudentBtn.addEventListener('click', openConfirmDeleteDialog);
            
            const cancelDeleteOptionsBtn = document.getElementById('cancel-delete-options-btn');
            cancelDeleteOptionsBtn.addEventListener('click', closeDeleteOptionsDialog);
            
            // Confirm delete dialog buttons
            const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
            confirmDeleteBtn.addEventListener('click', deleteStudent);
            
            const cancelConfirmDeleteBtn = document.getElementById('cancel-confirm-delete-btn');
            cancelConfirmDeleteBtn.addEventListener('click', closeConfirmDeleteDialog);
            
            // Create student dialog buttons
            const cancelCreateBtn = document.getElementById('cancel-create-btn');
            cancelCreateBtn.addEventListener('click', closeCreateStudentDialog);
            
            const saveCreateBtn = document.getElementById('save-create-btn');
            saveCreateBtn.addEventListener('click', openConfirmCreateDialog);
            
            // Create student form validation
            const createStudentForm = document.getElementById('create-student-form');
            createStudentForm.addEventListener('input', validateCreateStudentForm);
            
            // Confirm create dialog buttons
            const cancelConfirmCreateBtn = document.getElementById('cancel-confirm-create-btn');
            cancelConfirmCreateBtn.addEventListener('click', closeConfirmCreateDialog);
            
            const saveConfirmCreateBtn = document.getElementById('save-confirm-create-btn');
            saveConfirmCreateBtn.addEventListener('click', saveNewStudent);
            
            // Student table sorting
            const studentTableHeaders = document.querySelectorAll('#students-table th[data-sort]');
            studentTableHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const field = header.getAttribute('data-sort');
                    sortStudents(field);
                });
            });
            
            // "Select all" checkbox is now disabled since we only allow single selection
            
            // Active filter radio buttons
            const activeFilterRadios = document.querySelectorAll('input[name="active-filter"]');
            activeFilterRadios.forEach(radio => {
                radio.addEventListener('change', filterStudentsByActive);
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
                filterStudentsByInstructor();
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
                filterStudentsByGroup();
            });
            
            // Clear filters button
            const clearFiltersBtn = document.getElementById('clear-filters-btn');
            clearFiltersBtn.addEventListener('click', clearAllFilters);
        }
        
        // Fetch students data from Airtable
        async function fetchStudents() {
            try {
                console.log('GET operation - Sending request...');
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
                console.log('GET operation - Response data:', data);
                
                // Format Airtable records to student objects
                students = data.records.map(record => ({
                    id: record.id,
                    name: record.fields.Name || '',
                    group: record.fields.Group || '',
                    instructor: record.fields.Instructor || '',
                    birthday: record.fields.Birthday || '',
                    startDate: record.fields["Start Date"] || '',
                    active: record.fields.Active === true
                }));
                
                // Initialize visibleStudents with all students
                visibleStudents = [...students];
                
                // Extract unique instructors and groups
                extractUniqueValues();
                
                // Populate filter checkboxes
                populateFilterCheckboxes();
                
                // Display students
                displayStudents();
            } catch (error) {
                console.error('Error fetching students:', error);
                // Show error message
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
                    
                    filterStudentsByInstructor();
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
                    
                    filterStudentsByGroup();
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
        
        // Open view comments dialog
        function openViewCommentsDialog(studentId) {
            // Find student
            const student = students.find(s => s.id === studentId);
            if (!student) return;
            
            // Update dialog title with student name
            const dialogTitle = document.querySelector('#view-comments-dialog .dialog-title');
            dialogTitle.textContent = `Comments for ${student.name}`;
            
            // Filter dossiers for this student
            const studentDossiers = dossiers.filter(dossier => dossier.studentID === studentId);
            
            // Sort by timestamp descending
            studentDossiers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Display dossiers in the table
            const tableBody = document.getElementById('student-comments-table-body');
            tableBody.innerHTML = '';
            
            studentDossiers.forEach(dossier => {
                const row = document.createElement('tr');
                
                // Format timestamp for display
                const formattedTimestamp = dossier.timestamp ? new Date(dossier.timestamp).toLocaleString() : '';
                
                row.innerHTML = `
                    <td>${formattedTimestamp}</td>
                    <td>${dossier.record}</td>
                    <td>${dossier.createdBy}</td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Store the student ID for the Add Comment button
            document.getElementById('add-comment-btn').setAttribute('data-student-id', studentId);
            
            // Show dialog
            document.getElementById('view-comments-dialog').style.display = 'flex';
            
            // Select the student row in the table
            document.querySelectorAll('.row-select').forEach(checkbox => {
                if (checkbox.getAttribute('data-id') === studentId) {
                    checkbox.checked = true;
                } else {
                    checkbox.checked = false;
                }
            });
            
            // Update selected rows
            updateSelectedRows();
        }
        
        // Close view comments dialog
        function closeViewCommentsDialog() {
            document.getElementById('view-comments-dialog').style.display = 'none';
        }
        
        // Update selected rows array - only allow one selection at a time
        function updateSelectedRows(event) {
            // Get the checkbox that triggered this event (if any)
            const clickedCheckbox = event ? event.target : null;
            
            // Clear the selected rows array
            selectedRows = [];
            
            // Remove selected-row class from all rows
            document.querySelectorAll('#students-table tbody tr').forEach(row => {
                row.classList.remove('selected-row');
            });
            
            // Get the currently checked checkbox (should be only one or none)
            document.querySelectorAll('.row-select:checked').forEach(checkbox => {
                const studentId = checkbox.getAttribute('data-id');
                selectedRows.push(studentId);
                
                // Add selected-row class to the selected row
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.add('selected-row');
                }
            });
            
            console.log('Selected rows:', selectedRows);
            
            // Update create comment button state
            updateCreateCommentButtonState();
        }
        
        // Update buttons state based on selection
        function updateCreateCommentButtonState() {
            const createCommentBtn = document.getElementById('create-comment-btn');
            const editContactBtn = document.getElementById('edit-contact-btn');
            const deleteContactBtn = document.getElementById('delete-contact-btn');
            
            const hasSelection = selectedRows.length === 1;
            
            createCommentBtn.disabled = !hasSelection;
            editContactBtn.disabled = !hasSelection;
            deleteContactBtn.disabled = !hasSelection;
        }
        
        // Open comment dialog
        function openCommentDialog() {
            if (selectedRows.length !== 1) {
                return; // Only proceed if exactly one student is selected
            }
            
            // Clear previous input
            document.getElementById('comment-input').value = '';
            
            // Disable save button initially
            document.getElementById('save-comment-btn').disabled = true;
            
            // Show dialog
            document.getElementById('comment-dialog').style.display = 'flex';
        }
        
        // Close comment dialog
        function closeCommentDialog() {
            document.getElementById('comment-dialog').style.display = 'none';
        }
        
        // Validate comment input
        function validateCommentInput() {
            const commentInput = document.getElementById('comment-input');
            const saveCommentBtn = document.getElementById('save-comment-btn');
            
            // Enable save button only if input is not empty
            saveCommentBtn.disabled = commentInput.value.trim() === '';
        }
        
        // Save comment to Airtable
        async function saveComment() {
            if (selectedRows.length !== 1) {
                return; // Only proceed if exactly one student is selected
            }
            
            const studentId = selectedRows[0];
            const commentText = document.getElementById('comment-input').value.trim();
            
            if (commentText === '') {
                return; // Don't save empty comments
            }
            
            try {
                // Find student name for notification
                const student = students.find(s => s.id === studentId);
                const studentName = student ? student.name : 'Unknown';
                
                // Prepare record data
                const recordData = {
                    fields: {
                        Record: commentText,
                        studentID: studentId,
                        'Created By': 'Instructor 1',
                        Timestamp: new Date().toISOString()
                    }
                };
                
                // Send POST request to Airtable
                const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.dossiers}`;
                
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
                
                // Close dialog
                closeCommentDialog();
                
                // Show notification
                alert(`The comment to the student ${studentName} added`);
                
                // Refresh dossier data
                fetchDossiers();
                
            } catch (error) {
                console.error('Error saving comment:', error);
                alert('Error saving comment. Please try again.');
            }
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
                let valueA = a[field];
                let valueB = b[field];
                
                // Handle special cases for sorting
                if (field === 'birthday' || field === 'startDate') {
                    valueA = new Date(valueA);
                    valueB = new Date(valueB);
                } else if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
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
        
        // Filter students based on search input
        function filterStudents() {
            applyAllFilters();
        }
        
        // Filter students by active status
        function filterStudentsByActive() {
            applyAllFilters();
        }
        
        // Filter students by instructor
        function filterStudentsByInstructor() {
            applyAllFilters();
        }
        
        // Filter students by group
        function filterStudentsByGroup() {
            applyAllFilters();
        }
        
        // Apply all filters
        function applyAllFilters() {
            // Get search term
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            
            // Get active filter value
            const activeFilter = document.querySelector('input[name="active-filter"]:checked').value;
            
            // Get selected instructors
            const selectedInstructors = Array.from(document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors):checked')).map(checkbox => checkbox.value);
            
            // Get selected groups
            const selectedGroups = Array.from(document.querySelectorAll('.group-checkbox:not(#select-all-groups):checked')).map(checkbox => checkbox.value);
            
            // Apply filters
            const filtered = students.filter(student => {
                // Search filter
                const matchesSearch = !searchTerm || 
                    student.name.toLowerCase().includes(searchTerm) ||
                    student.group.toLowerCase().includes(searchTerm) ||
                    student.instructor.toLowerCase().includes(searchTerm);
                
                // Active filter
                const matchesActive = 
                    activeFilter === 'all' || 
                    (activeFilter === 'active' && student.active === true) ||
                    (activeFilter === 'non-active' && student.active !== true);
                
                // Instructor filter
                const matchesInstructor = selectedInstructors.length === 0 || selectedInstructors.includes(student.instructor);
                
                // Group filter
                const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(student.group);
                
                return matchesSearch && matchesActive && matchesInstructor && matchesGroup;
            });
            
            // Store the filtered students for dossier filtering
            visibleStudents = filtered;
            
            // Display filtered students
            displayStudents(filtered);
            
            // Update filter counts based on cross-filtering
            updateFilterCounts(filtered);
        }
        
        // Clear all filters and reset to default state
        function clearAllFilters() {
            // Reset search input
            const searchInput = document.getElementById('search-input');
            searchInput.value = '';
            
            // Reset active filter to "Active"
            document.getElementById('active-only').checked = true;
            
            // Reset instructor checkboxes
            document.getElementById('select-all-instructors').checked = true;
            document.querySelectorAll('.instructor-checkbox:not(#select-all-instructors)').forEach(checkbox => {
                checkbox.checked = true;
                checkbox.disabled = false;
                // Make sure the row is visible
                const row = checkbox.closest('tr');
                if (row) {
                    row.style.display = '';
                }
            });
            
            // Reset group checkboxes
            document.getElementById('select-all-groups').checked = true;
            document.querySelectorAll('.group-checkbox:not(#select-all-groups)').forEach(checkbox => {
                checkbox.checked = true;
                checkbox.disabled = false;
                // Make sure the row is visible
                const row = checkbox.closest('tr');
                if (row) {
                    row.style.display = '';
                }
            });
            
            // Apply filters to update the display
            applyAllFilters();
        }
        
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
