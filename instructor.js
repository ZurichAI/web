// Instructor Portal JavaScript

// Configuration
const config = {
    // n8n webhook URL - using a single endpoint for all operations
    webhooks: {
        getStudents: 'https://zurich.app.n8n.cloud/webhook/api/students',
        addStudent: 'https://zurich.app.n8n.cloud/webhook/api/students',
        updateStudent: 'https://zurich.app.n8n.cloud/webhook/api/students',
        deleteStudent: 'https://zurich.app.n8n.cloud/webhook/api/students'
    }
};

// Instructor credentials will be loaded from instructors.json
let instructors = [];

// Load instructor credentials
async function loadInstructors() {
    // Check if we're running from a file:// URL (local file system)
    // In this case, we'll use hardcoded credentials to avoid CORS issues
    if (window.location.protocol === 'file:') {
        console.log('Running locally, using hardcoded instructor credentials');
        instructors = [
            { email: 'instructor1@example.com', password: 'password1', name: 'Instructor 1' },
            { email: 'instructor2@example.com', password: 'password2', name: 'Instructor 2' },
            { email: 'instructor3@example.com', password: 'password3', name: 'Instructor 3' },
            { email: 'instructor4@example.com', password: 'password4', name: 'Instructor 4' },
            { email: 'instructor5@example.com', password: 'password5', name: 'Instructor 5' }
        ];
        return;
    }
    
    // If we're running from a server, try to load from JSON file
    try {
        const response = await fetch('instructors.json');
        const data = await response.json();
        instructors = data.instructors;
    } catch (error) {
        console.error('Error loading instructor credentials:', error);
        // Fallback to demo credentials if file can't be loaded
        instructors = [
            { email: 'instructor1@example.com', password: 'password1', name: 'Instructor 1' },
            { email: 'instructor2@example.com', password: 'password2', name: 'Instructor 2' }
        ];
    }
}

// Global state
let currentUser = null;
let students = [];
let currentSort = { field: 'name', direction: 'asc' };

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const loginAlert = document.getElementById('login-alert');
const dashboard = document.getElementById('dashboard');
const instructorNameElement = document.getElementById('instructor-name');
const logoutButton = document.getElementById('logout-btn');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const studentsTableBody = document.getElementById('students-table-body');
const searchInput = document.getElementById('search-input');
const viewSelector = document.getElementById('view-selector');
const addStudentForm = document.getElementById('add-student-form');
const addStudentAlert = document.getElementById('add-student-alert');
const editModal = document.getElementById('edit-modal');
const editStudentForm = document.getElementById('edit-student-form');
const editStudentAlert = document.getElementById('edit-student-alert');
const cancelEditButton = document.getElementById('cancel-edit');
const tableHeaders = document.querySelectorAll('th[data-sort]');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
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
});

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
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Find instructor with matching credentials
    const instructor = instructors.find(i => i.email === email && i.password === password);
    
    if (instructor) {
        // Store user info (excluding password)
        currentUser = { email: instructor.email, name: instructor.name };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show dashboard
        showDashboard();
        
        // Fetch students data
        fetchStudents();
    } else {
        // Show error message
        loginAlert.textContent = 'Invalid email or password';
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

// Fetch students data from n8n webhook
async function fetchStudents() {
    try {
        // Fetch students from n8n webhook
        console.log('GET operation - Sending request...');
        const response = await fetch(`${config.webhooks.getStudents}?operation=getStudents`);
        console.log('GET operation - Response status:', response.status);
        
        const data = await response.json();
        console.log('GET operation - Response data:', data);
        
        students = data;
        
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
            const studentId = parseInt(button.getAttribute('data-id'));
            openEditModal(studentId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const studentId = parseInt(button.getAttribute('data-id'));
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
        // Send data to n8n webhook
        console.log('POST operation - Student data:', newStudent);
        console.log('POST operation - Request URL:', `${config.webhooks.addStudent}?operation=addStudent`);
        
        const response = await fetch(`${config.webhooks.addStudent}?operation=addStudent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStudent)
        });
        
        console.log('POST operation - Response status:', response.status);
        
        const data = await response.json();
        console.log('POST operation - Response data:', data);
        
        // Show success message
        addStudentAlert.textContent = 'Student added successfully';
        addStudentAlert.className = 'alert alert-success';
        addStudentAlert.style.display = 'block';
        
        // Reset form
        addStudentForm.reset();
        
        // Update display
        displayStudents();
        
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
    const studentId = parseInt(formData.get('id'));
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
        // Send data to n8n webhook
        console.log('PUT operation - Student data:', updatedStudent);
        console.log('PUT operation - Request URL:', `${config.webhooks.updateStudent}?operation=updateStudent`);
        
        const response = await fetch(`${config.webhooks.updateStudent}?operation=updateStudent`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedStudent)
        });
        
        console.log('PUT operation - Response status:', response.status);
        
        const data = await response.json();
        console.log('PUT operation - Response data:', data);
        
        // Show success message
        editStudentAlert.textContent = 'Student updated successfully';
        editStudentAlert.className = 'alert alert-success';
        editStudentAlert.style.display = 'block';
        
        // Update display
        displayStudents();
        
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
        // Add detailed console logs for debugging
        console.log('DELETE operation - Student ID:', studentId);
        console.log('DELETE operation - Request URL:', `${config.webhooks.deleteStudent}?operation=deleteStudent`);
        console.log('DELETE operation - Request body:', JSON.stringify({ id: studentId }));
        
        try {
            // Using POST method with operation=deleteStudent in query and ID in body
            // This is a workaround for DELETE operations that might have issues
            // Also setting mode to 'no-cors' to handle CORS issues
            console.log('DELETE operation - Sending request with no-cors mode...');
            const response = await fetch(`${config.webhooks.deleteStudent}?operation=deleteStudent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: studentId }),
                mode: 'no-cors' // Add no-cors mode to handle CORS issues
            });
            
            console.log('DELETE operation - Response received');
            
            // With no-cors mode, we can't access the response data
            // So we just display a success message
            
            // Update display
            displayStudents();
            
            // Show success message (could add a toast notification here)
            alert('Student deleted successfully (no-cors mode)');
        } catch (error) {
            console.error('DELETE operation - Fetch error:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        
        // Show error message
        alert('Error deleting student. Please try again.');
    }
}
