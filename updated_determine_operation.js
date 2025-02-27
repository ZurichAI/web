// Updated function to determine operation based on query parameter
// This function should replace the existing "Determine Operation" function in the n8n workflow

// Determine the operation type based on query parameter
const headers = $input.item.headers || {};
const params = $input.item.params || {};
const query = $input.item.query || {};
const body = $input.item.body || {};
const path = $input.item.params.path || '';

// Log the input for debugging
console.log('Webhook input:', JSON.stringify($input.item, null, 2));

// Check if operation is specified in query parameter
if (query.operation) {
  // Map the new operation names to the ones expected by the Switch node
  const operationMap = {
    'getStudents': 'GET',
    'addStudent': 'POST',
    'updateStudent': 'PUT',
    'deleteStudent': 'DELETE'
  };
  
  const operation = operationMap[query.operation] || query.operation;
  
  // Special handling for deleteStudent operation
  // We're now using POST method with operation=deleteStudent and ID in the body
  if (query.operation === 'deleteStudent' && body && body.id) {
    return { operation: 'DELETE', id: body.id };
  }
  
  // For DELETE operation (legacy path-based approach), extract ID from URL path
  if (operation === 'DELETE' && path.match(/\/([^\/]+)$/)) {
    return { operation, id: path.match(/\/([^\/]+)$/)[1] };
  }
  
  // For PUT operation, include the data
  if (operation === 'PUT' && body) {
    return { operation, data: body };
  }
  
  // For POST operation, include the data
  if (operation === 'POST' && body) {
    return { operation, data: body };
  }
  
  // For GET operation
  if (operation === 'GET') {
    return { operation };
  }
  
  // Default case if operation is specified but not recognized
  return { operation };
}

// Fallback to the original logic if no operation query parameter is provided
// This ensures backward compatibility with any existing integrations

// Check if this is a DELETE operation (URL path contains an ID)
if (path.match(/\/([^\/]+)$/)) {
  return { operation: 'DELETE', id: path.match(/\/([^\/]+)$/)[1] };
}

// Check if this is a PUT operation (has body with ID)
else if (body && body.id) {
  return { operation: 'PUT', data: body };
}

// Check if this is a POST operation (has body but no ID)
else if (body && Object.keys(body).length > 0) {
  return { operation: 'POST', data: body };
}

// Default to GET operation
else {
  return { operation: 'GET' };
}
