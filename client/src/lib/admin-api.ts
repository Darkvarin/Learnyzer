// Admin API helper functions with session management

const getAdminSession = (): string | null => {
  return localStorage.getItem('adminSession');
};

const makeAdminRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const adminSession = getAdminSession();
  
  if (!adminSession) {
    throw new Error('Admin session required');
  }

  const headers = {
    'Content-Type': 'application/json',
    'admin-session': adminSession,
    ...options.headers,
  };

  return fetch(endpoint, {
    ...options,
    headers,
  });
};

export const adminApi = {
  // Lead generation APIs
  getLeads: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const response = await makeAdminRequest(`/api/leads?${params}`);
    if (!response.ok) throw new Error('Failed to fetch leads');
    return response.json();
  },

  getLeadStats: async () => {
    const response = await makeAdminRequest('/api/leads/stats');
    if (!response.ok) throw new Error('Failed to fetch lead stats');
    return response.json();
  },

  exportLeads: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const response = await makeAdminRequest(`/api/leads/export?${params}`);
    if (!response.ok) throw new Error('Failed to export leads');
    return response.blob();
  },

  getEmailList: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const response = await makeAdminRequest(`/api/leads/email-list?${params}`);
    if (!response.ok) throw new Error('Failed to fetch email list');
    return response.json();
  },

  getMobileList: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const response = await makeAdminRequest(`/api/leads/mobile-list?${params}`);
    if (!response.ok) throw new Error('Failed to fetch mobile list');
    return response.json();
  },

  searchLeads: async (query: string) => {
    const response = await makeAdminRequest(`/api/leads/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search leads');
    return response.json();
  },
};