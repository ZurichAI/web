// Configuration settings

// Airtable API configuration
const config = {
    airtable: {
        apiKey: 'patDOF9oxwBSX51xF.35a49f7d32794d0af49cbb224077937df851caf037eb821dd46034e79018b111',
        baseId: 'appTgYGpfTSWAPkLC',
        tables: {
            students: 'tblclIYLAoNfisfA4',  // Current table (renamed to be more descriptive)
            // Add additional tables here
            // For example:
            // courses: 'tblXXXXXXXXXXXX',
            // assignments: 'tblYYYYYYYYYYYY',
        }
    }
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    // For Node.js environments
    module.exports = config;
} else {
    // For browser environments
    window.config = config;
}
