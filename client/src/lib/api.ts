/**
 * Helper function to make API requests
 */
export async function apiRequest(
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(data && { body: JSON.stringify(data) }),
    };

    const response = await fetch(endpoint, options);
    
    return response;
  } catch (error) {
    // API request failed
    throw error;
  }
}