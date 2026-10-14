const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('workforce_token');

  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Token expired / invalid
    if (response.status === 401) {
      localStorage.removeItem('workforce_token');
      localStorage.removeItem('workforce_user');
    }

    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

export const api = {
  // =========================
  // AUTHENTICATION
  // =========================

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    return handleResponse(res);
  },


async getMyEmployee() {
  const res = await fetch(`${BASE_URL}/employees/me`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders()
    }
  });

  return handleResponse(res);
},


  // =========================
  // HEALTH
  // =========================

  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // =========================
  // DASHBOARD STATS
  // =========================

  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    return handleResponse(res);
  },

  // =========================
  // EMPLOYEES CRUD
  // =========================

  async getEmployees(params = {}) {
    const query = new URLSearchParams();

    if (params.q) {
      query.append('q', params.q);
    }

    if (params.department && params.department !== 'All') {
      query.append('department', params.department);
    }

    if (params.riskLevel && params.riskLevel !== 'All') {
      query.append('riskLevel', params.riskLevel);
    }

    if (params.jobRole && params.jobRole !== 'All') {
      query.append('jobRole', params.jobRole);
    }

    const queryString = query.toString()
      ? `?${query.toString()}`
      : '';

    const res = await fetch(
      `${BASE_URL}/employees${queryString}`,
      {
        headers: {
          ...getAuthHeaders()
        }
      }
    );

    return handleResponse(res);
  },

  async getEmployeeById(id) {
    const res = await fetch(
      `${BASE_URL}/employees/${id}`,
      {
        headers: {
          ...getAuthHeaders()
        }
      }
    );

    return handleResponse(res);
  },

  async createEmployee(data) {
    const res = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });

    return handleResponse(res);
  },

  async updateEmployee(id, data) {
    const res = await fetch(`${BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });

    return handleResponse(res);
  },

  async deleteEmployee(id) {
    const res = await fetch(
      `${BASE_URL}/employees/${id}`,
      {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      }
    );

    return handleResponse(res);
  },

  // =========================
  // ATTRITION ML PREDICTION
  // =========================

  async predictAttrition(payload) {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    return handleResponse(res);
  },

  // =========================
  // SKILLS
  // =========================

  async getSkillsForEmployee(employeeId) {
    const res = await fetch(
      `${BASE_URL}/skills/${employeeId}`,
      {
        headers: {
          ...getAuthHeaders()
        }
      }
    );

    return handleResponse(res);
  },

  async recommendSkills(payload) {
    const res = await fetch(`${BASE_URL}/skills/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    return handleResponse(res);
  },

  async getRolesCatalog() {
    const res = await fetch(`${BASE_URL}/skills/roles/catalog`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    return handleResponse(res);
  },

  // =========================
  // SERPAPI RECOMMENDATIONS
  // =========================

  async getRecommendationsForEmployee(
    employeeId,
    targetRole = ''
  ) {
    const query = targetRole
      ? `?targetRole=${encodeURIComponent(targetRole)}`
      : '';

    const res = await fetch(
      `${BASE_URL}/recommendations/${employeeId}${query}`,
      {
        headers: {
          ...getAuthHeaders()
        }
      }
    );

    return handleResponse(res);
  },

  async searchLiveResources(payload) {
    const res = await fetch(
      `${BASE_URL}/recommendations/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      }
    );

    return handleResponse(res);
  }
};