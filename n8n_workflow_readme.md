# n8n Workflow for Student API

This document explains how to import and configure the n8n workflow for the Student API that integrates with Airtable.

## Overview

The workflow provides a single webhook endpoint that handles all CRUD operations for student data:

- **GET** - Fetch all students
- **POST** - Add a new student
- **PUT** - Update an existing student
- **DELETE** - Delete a student

All operations use the same webhook URL but different HTTP methods to determine the action.

## Importing the Workflow

1. Download the `n8n_workflow.json` file from this directory
2. Open your n8n instance
3. Go to Workflows
4. Click on the "Import from File" button (or "Import from URL" if you're hosting the file online)
5. Select the downloaded `n8n_workflow.json` file
6. Click "Import"

## Configuration

After importing, you need to configure the workflow with your Airtable credentials and environment variables:

### 1. Set up Airtable Credentials

1. Click on the Airtable nodes in the workflow
2. Click "Create New" under the credentials dropdown
3. Enter your Airtable API key
4. Save the credentials

### 2. Set Environment Variables

The workflow uses environment variables for the Airtable Base ID and Table ID. You need to set these in n8n:

1. Go to Settings > Variables
2. Add the following variables:
   - `AIRTABLE_BASE_ID`: Your Airtable base ID
   - `AIRTABLE_TABLE_ID`: Your Airtable table ID (or table name)

### 3. Activate the Workflow

1. Click the "Activate" toggle in the top-right corner of the workflow editor
2. The webhook is now active and ready to receive requests

## Testing the Workflow

The webhook URL will be displayed in the Webhook node. It will look something like:
```
https://your-n8n-instance.com/webhook/api/students
```

You can test the API using the about.html page in the ZurichAI web directory, which is already configured to use this endpoint.

## Webhook URL

Make sure the webhook URL in your n8n instance matches the one configured in:

1. `instructor.js` - The config object at the top of the file
2. `about.html` - The webhookUrl variable in the JavaScript section

If your n8n instance generates a different URL, update these files with the correct URL.

## Troubleshooting

- **Error: "Student ID not found in URL path"** - This occurs when trying to delete a student without providing an ID in the URL path. Make sure the DELETE request URL ends with the student ID (e.g., `/api/students/123`).

- **Airtable Authentication Errors** - Check that your Airtable API key is correct and has access to the specified base and table.

- **Environment Variable Errors** - Ensure that the `AIRTABLE_BASE_ID` and `AIRTABLE_TABLE_ID` environment variables are set correctly in n8n.

## Customization

You can customize the workflow to fit your specific needs:

- **Field Mapping** - Modify the field mappings in the Airtable nodes to match your Airtable table structure
- **Response Format** - Adjust the Set nodes to change the format of the API responses
- **Error Handling** - Add error handling nodes to provide more detailed error messages

## Security Considerations

The current workflow does not include authentication. For production use, consider adding:

1. **Authentication** - Add a Function node before the Switch node to validate API keys or tokens
2. **CORS Configuration** - Configure CORS settings in the Webhook node to restrict access to specific domains
3. **Input Validation** - Add validation for incoming data to prevent security issues

## Maintenance

Periodically check:
- That the webhook is still active
- That the Airtable connection is working
- For any security updates needed
