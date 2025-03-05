function updateClockAndDate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
    const dateElement = document.getElementById('date');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
}
setInterval(updateClockAndDate, 1000);
updateClockAndDate();

// Instructor Portal JavaScript

// Instructor credentials will be loaded from instructors.json
let instructors = [];

// Load instructor credentials
async function loadInstructors() {
    // Load from JSON file
    try {
        const response = await fetch('instructors.json');
        const data = await response.json();
        instructors = data.instructors;
    } catch (error) {
        console.error('Error loading instructor credentials:', error);
        // Fallback to demo credentials if file can't be loaded
        instructors = [
            { name: 'Instructor 1', password: 'password1' },
            { name: 'Instructor 2', password: 'password2' }
        ];
    }
}

// Global state
let currentUser = null;
let students = [];
let currentSort = { field: 'name', direction: 'asc' };

// DOM Elements
let loginForm, loginContainer, loginAlert, dashboard, instructorNameElement, logoutButton;
let tabButtons, tabContents, studentsTableBody, searchInput, viewSelector;
let addStudentForm, addStudentAlert, editModal, editStudentForm, editStudentAlert, cancelEditButton;
let tableHeaders;

// Initialize instructor portal elements if they exist
function initInstructorElements() {
    loginForm = document.getElementById('login-form');
    loginContainer = document.getElementById('login-container');
    loginAlert = document.getElementById('login-alert');
    dashboard = document.getElementById('dashboard');
    instructorNameElement = document.getElementById('instructor-name');
    logoutButton = document.getElementById('logout-btn');
    tabButtons = document.querySelectorAll('.tab-button');
    tabContents = document.querySelectorAll('.tab-content');
    studentsTableBody = document.getElementById('students-table-body');
    searchInput = document.getElementById('search-input');
    viewSelector = document.getElementById('view-selector');
    addStudentForm = document.getElementById('add-student-form');
    addStudentAlert = document.getElementById('add-student-alert');
    editModal = document.getElementById('edit-modal');
    editStudentForm = document.getElementById('edit-student-form');
    editStudentAlert = document.getElementById('edit-student-alert');
    cancelEditButton = document.getElementById('cancel-edit');
    tableHeaders = document.querySelectorAll('th[data-sort]');
    
    // Only initialize instructor portal if elements exist
    if (loginForm) {
        initInstructorPortal();
    }
}

// Check if user is already logged in
async function initInstructorPortal() {
    // Load instructor credentials
    await loadInstructors();
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        fetchStudents();
    }
    
    // Initialize event listeners
    initEventListeners();
}

// Initialize all event listeners
function initEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutButton.addEventListener('click', handleLogout);
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Table sorting
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-sort');
            sortStudents(field);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', filterStudents);
    
    // View selector
    viewSelector.addEventListener('change', changeView);
    
    // Add student form
    addStudentForm.addEventListener('submit', handleAddStudent);
    
    // Edit student form
    editStudentForm.addEventListener('submit', handleEditStudent);
    
    // Cancel edit button
    cancelEditButton.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    
    // Find instructor with matching credentials
    const instructor = instructors.find(i => i.login === login && i.password === password);
    
    if (instructor) {
        // Store user info (excluding password)
        currentUser = { name: instructor.name };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show dashboard
        showDashboard();
        
        // Fetch students data
        fetchStudents();
    } else {
        // Show error message
        loginAlert.textContent = 'Invalid login or password';
        loginAlert.style.display = 'block';
    }
}

// Handle logout
function handleLogout() {
    // Clear user data
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Show login form
    loginContainer.style.display = 'block';
    dashboard.style.display = 'none';
}

// Show dashboard after login
function showDashboard() {
    loginContainer.style.display = 'none';
    dashboard.style.display = 'block';
    instructorNameElement.textContent = currentUser.name;
}

// Switch between tabs
function switchTab(tabId) {
    // Update tab buttons
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update tab contents
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Fetch students data directly from Airtable
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
        
        // Display students
        displayStudents();
    } catch (error) {
        console.error('Error fetching students:', error);
        // Show error message
    }
}

// Display students in the table
function displayStudents(filteredStudents = null) {
    const studentsToDisplay = filteredStudents || students;
    
    // Clear table
    studentsTableBody.innerHTML = '';
    
    // Add students to table
    studentsToDisplay.forEach(student => {
        const row = document.createElement('tr');
        
        // Format dates for display
        const formattedBirthday = new Date(student.birthday).toLocaleDateString();
        const formattedStartDate = new Date(student.startDate).toLocaleDateString();
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.group}</td>
            <td>${student.instructor}</td>
            <td>${formattedBirthday}</td>
            <td>${formattedStartDate}</td>
            <td>${student.active ? 'Yes' : 'No'}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${student.id}">Edit</button>
                <button class="delete-btn" data-id="${student.id}">Delete</button>
            </td>
        `;
        
        studentsTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const studentId = button.getAttribute('data-id');
            openEditModal(studentId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const studentId = button.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this student?')) {
                deleteStudent(studentId);
            }
        });
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
    
    // Update display
    displayStudents();
    
    // Update table headers
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
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayStudents();
        return;
    }
    
    const filtered = students.filter(student => {
        return (
            student.name.toLowerCase().includes(searchTerm) ||
            student.group.toLowerCase().includes(searchTerm) ||
            student.instructor.toLowerCase().includes(searchTerm)
        );
    });
    
    displayStudents(filtered);
}

// Change view (all, group by group, group by instructor)
function changeView() {
    const viewType = viewSelector.value;
    
    if (viewType === 'all') {
        // Display all students
        displayStudents();
    } else if (viewType === 'group') {
        // Group by group
        const groups = {};
        
        students.forEach(student => {
            if (!groups[student.group]) {
                groups[student.group] = [];
            }
            groups[student.group].push(student);
        });
        
        // Clear table
        studentsTableBody.innerHTML = '';
        
        // Add grouped students to table
        Object.keys(groups).sort().forEach(group => {
            // Add group header
            const groupHeader = document.createElement('tr');
            groupHeader.innerHTML = `<td colspan="7" style="background-color: #e0e0e0; font-weight: bold;">Group: ${group}</td>`;
            studentsTableBody.appendChild(groupHeader);
            
            // Add students in group
            displayStudents(groups[group]);
        });
    } else if (viewType === 'instructor') {
        // Group by instructor
        const instructorGroups = {};
        
        students.forEach(student => {
            if (!instructorGroups[student.instructor]) {
                instructorGroups[student.instructor] = [];
            }
            instructorGroups[student.instructor].push(student);
        });
        
        // Clear table
        studentsTableBody.innerHTML = '';
        
        // Add grouped students to table
        Object.keys(instructorGroups).sort().forEach(instructor => {
            // Add instructor header
            const instructorHeader = document.createElement('tr');
            instructorHeader.innerHTML = `<td colspan="7" style="background-color: #e0e0e0; font-weight: bold;">Instructor: ${instructor}</td>`;
            studentsTableBody.appendChild(instructorHeader);
            
            // Add students with instructor
            displayStudents(instructorGroups[instructor]);
        });
    }
}

// Format student data for Airtable
function formatStudentForAirtable(student) {
    // Create fields object with correct Airtable field names
    const fields = {
        Name: student.name,
        Group: student.group,
        Instructor: student.instructor,
        Birthday: student.birthday,
        Active: student.active
    };
    
    // Only include startDate if it's not null or empty
    if (student.startDate && student.startDate.trim() !== '') {
        // Use "Start Date" instead of "StartDate" (with a space)
        fields["Start Date"] = student.startDate;
    }
    
    return { fields };
}

// Handle add student form submission
async function handleAddStudent(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(addStudentForm);
    const newStudent = {
        name: formData.get('name'),
        group: formData.get('group'),
        instructor: formData.get('instructor'),
        birthday: formData.get('birthday'),
        startDate: formData.get('startDate'),
        active: formData.get('active') === 'true'
    };
    
    try {
        console.log('POST operation - Student data:', newStudent);
        
        // Format student data for Airtable
        const airtableData = formatStudentForAirtable(newStudent);
        
        // Send data to Airtable
        const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.students}`;
        
        const response = await fetch(airtableApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.airtable.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });
        
        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('POST operation - Response data:', data);
        
        // Show success message
        addStudentAlert.textContent = 'Student added successfully';
        addStudentAlert.className = 'alert alert-success';
        addStudentAlert.style.display = 'block';
        
        // Reset form
        addStudentForm.reset();
        
        // Refresh student list
        fetchStudents();
        
        // Switch to view students tab after a delay
        setTimeout(() => {
            switchTab('view-students');
            addStudentAlert.style.display = 'none';
        }, 2000);
    } catch (error) {
        console.error('Error adding student:', error);
        
        // Show error message
        addStudentAlert.textContent = 'Error adding student. Please try again.';
        addStudentAlert.className = 'alert alert-danger';
        addStudentAlert.style.display = 'block';
    }
}

// Open edit modal for a student
function openEditModal(studentId) {
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        return;
    }
    
    // Fill form with student data
    document.getElementById('edit-id').value = student.id;
    document.getElementById('edit-name').value = student.name;
    document.getElementById('edit-group').value = student.group;
    document.getElementById('edit-instructor').value = student.instructor;
    document.getElementById('edit-birthday').value = student.birthday;
    document.getElementById('edit-startDate').value = student.startDate;
    document.getElementById('edit-active').value = student.active.toString();
    
    // Show modal
    editModal.style.display = 'block';
}

// Handle edit student form submission
async function handleEditStudent(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(editStudentForm);
    const studentId = formData.get('id');
    const updatedStudent = {
        id: studentId,
        name: formData.get('name'),
        group: formData.get('group'),
        instructor: formData.get('instructor'),
        birthday: formData.get('birthday'),
        startDate: formData.get('startDate'),
        active: formData.get('active') === 'true'
    };
    
    try {
        console.log('PATCH operation - Student data:', updatedStudent);
        
        // Format student data for Airtable
        const airtableData = formatStudentForAirtable(updatedStudent);
        
        // Send data to Airtable
        const airtableApiUrl = `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tables.students}/${studentId}`;
        
        const response = await fetch(airtableApiUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${config.airtable.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Airtable API error response:', errorText);
            throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('PATCH operation - Response data:', data);
        
        // Show success message
        editStudentAlert.textContent = 'Student updated successfully';
        editStudentAlert.className = 'alert alert-success';
        editStudentAlert.style.display = 'block';
        
        // Refresh student list
        fetchStudents();
        
        // Close modal after a delay
        setTimeout(() => {
            editModal.style.display = 'none';
            editStudentAlert.style.display = 'none';
        }, 2000);
    } catch (error) {
        console.error('Error updating student:', error);
        
        // Show error message
        editStudentAlert.textContent = 'Error updating student. Please try again.';
        editStudentAlert.className = 'alert alert-danger';
        editStudentAlert.style.display = 'block';
    }
}

// Delete a student
async function deleteStudent(studentId) {
    try {
        console.log('DELETE operation - Student ID:', studentId);
        
        // Send delete request to Airtable
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
        
        const data = await response.json();
        console.log('DELETE operation - Response data:', data);
        
        // Refresh student list
        fetchStudents();
        
        // Show success message
        alert('Student deleted successfully');
    } catch (error) {
        console.error('Error deleting student:', error);
        
        // Show error message
        alert('Error deleting student. Please try again.');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize instructor portal elements if they exist
    initInstructorElements();
});
