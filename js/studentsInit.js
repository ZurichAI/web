// Global variables
let students = [];
let instructors = [];
let groups = [];
let dossiers = [];
let costs = [];
let payments = [];
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
    
    // Fetch costs and payments data for balance calculation
    fetchStudentCosts();
    fetchStudentPayments();
    
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
