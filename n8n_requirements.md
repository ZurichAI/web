# n8n Workflow Requirements for Instructor Portal

This document outlines the requirements for setting up an n8n workflow to integrate the Instructor Portal with Airtable.

## Overview

The Instructor Portal needs to connect to Airtable to perform the following operations:
1. Fetch student data
2. Add new students
3. Update existing student records
4. Delete student records

## Airtable Structure

The Airtable database should have a table for students with the following fields:
- Name (Text)
- Group (Text)
- Instructor (Text)
- Birthday (Date)
- StartDate (Date)
- Active (Boolean)

## Single Webhook Approach

Due to the limitation of only 5 active workflows in the basic n8n subscription plan, we'll use a single webhook that handles all four operations (GET, POST, PUT, DELETE) instead of creating separate workflows for each operation.

### Universal Webhook Endpoint

**Endpoint**: `https://zurich.app.n8n.cloud/webhook/api/students`

This single endpoint will handle all operations based on the HTTP method:

### 1. GET Request

**Purpose**: Fetch all student records from Airtable
**HTTP Method**: GET
**Response Format**:
```json
[
  {
    "id": "rec123abc",
    "name": "John Doe",
    "group": "Beginner",
    "instructor": "Instructor 1",
    "birthday": "1990-05-15",
    "startDate": "2023-01-10",
    "active": true
  },
  ...
]
```

### 2. POST Request

**Purpose**: Add a new student record to Airtable
**HTTP Method**: POST
**Request Body**:
```json
{
  "name": "New Student",
  "group": "Intermediate",
  "instructor": "Instructor 2",
  "birthday": "1995-03-20",
  "startDate": "2023-04-15",
  "active": true
}
```
**Response Format**:
```json
{
  "success": true,
  "id": "rec456def",
  "message": "Student added successfully"
}
```

### 3. PUT Request

**Purpose**: Update an existing student record in Airtable
**HTTP Method**: PUT
**Request Body**:
```json
{
  "id": "rec123abc",
  "name": "John Doe Updated",
  "group": "Advanced",
  "instructor": "Instructor 3",
  "birthday": "1990-05-15",
  "startDate": "2023-01-10",
  "active": false
}
```
**Response Format**:
```json
{
  "success": true,
  "message": "Student updated successfully"
}
```

### 4. DELETE Request

**Purpose**: Delete a student record from Airtable
**HTTP Method**: DELETE
**URL Parameter**: id - The Airtable record ID of the student to delete (e.g., `/students/rec123abc`)
**Response Format**:
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

## n8n Workflow Setup Instructions

1. **Create a new workflow** in n8n.

2. **Add a Webhook node** as the trigger:
   - Configure the webhook path (e.g., `/api/students`)
   - Enable all HTTP methods (GET, POST, PUT, DELETE)
   - For POST and PUT methods, parse the JSON body

3. **Add a Switch node** after the webhook:
   - Use the expression `$input.item.method` to route based on HTTP method
   - Create branches for GET, POST, PUT, and DELETE

4. **For the GET branch**:
   - Add an Airtable node with "List Records" operation
   - Configure the base and table
   - Optionally add filtering or sorting parameters
   - Add a Set node to format the response

5. **For the POST branch**:
   - Add an Airtable node with "Create Record" operation
   - Map the incoming JSON fields to the Airtable fields
   - Add a Set node to format the response with success message and new record ID

6. **For the PUT branch**:
   - Add an Airtable node with "Update Record" operation
   - Use the incoming record ID to identify the record to update
   - Map the incoming JSON fields to the Airtable fields
   - Add a Set node to format the response with success message

7. **For the DELETE branch**:
   - Extract the record ID from the URL path
   - Add an Airtable node with "Delete Record" operation
   - Use the extracted ID to identify the record to delete
   - Add a Set node to format the response with success message

8. **Add a Join node** to combine all branches.

9. **Add a Respond to Webhook node** as the final step:
   - Set the response code (200 for success, 4xx for errors)
   - Set the response body to the output from the previous nodes

## Instructor Portal Configuration Update

The Instructor Portal needs to be updated to use the single webhook URL. Update the `config` object in the `instructor.js` file:

```javascript
const config = {
    webhooks: {
        getStudents: 'https://zurich.app.n8n.cloud/webhook/api/students',
        addStudent: 'https://zurich.app.n8n.cloud/webhook/api/students',
        updateStudent: 'https://zurich.app.n8n.cloud/webhook/api/students',
        deleteStudent: 'https://zurich.app.n8n.cloud/webhook/api/students'
    }
};
```

The about.html page also needs to be updated to use the single webhook URL.

## Error Handling

Ensure your n8n workflows include proper error handling:
- Validate incoming data
- Return appropriate error messages and status codes
- Handle Airtable API errors gracefully

## Security

Since the Instructor Portal contains sensitive student information, consider implementing these security measures:

1. **Authentication**: Ensure your n8n webhooks are protected. You can:
   - Add authentication headers to your webhook requests
   - Use n8n's webhook authentication features
   - Set up IP restrictions if possible

2. **CORS Configuration**: Configure CORS settings in your n8n webhooks to only allow requests from your website's domain.

3. **Data Validation**: Validate all incoming data in your n8n workflows before processing it.

4. **Error Handling**: Don't expose sensitive information in error messages.

5. **HTTPS**: Ensure all communication between the Instructor Portal and n8n uses HTTPS.

## Testing

Before deploying to production:

1. Test each webhook endpoint individually
2. Verify that data is correctly saved to and retrieved from Airtable
3. Test error scenarios (e.g., invalid data, network issues)
4. Test the entire flow from the Instructor Portal UI

## Maintenance

Periodically check:
- That the webhooks are still active and responding
- That the Airtable connection is working
- For any security updates needed
