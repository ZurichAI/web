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
        
