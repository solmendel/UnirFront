export interface Collaborator {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const BASE_URL = `${(import.meta as any).env.VITE_COLLABORATOR_API_URL}/api/collaborators`;

// Función auxiliar para obtener el token del localStorage
function getAuthToken(): string | null {
  // El authService usa 'unir-session' (con guión)
  const session = localStorage.getItem('unir-session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.token || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Función auxiliar para obtener headers con autenticación
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const collaboratorService = {
  async getAll(): Promise<Collaborator[]> {
    const res = await fetch(BASE_URL, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener colaboradores");
    return res.json();
  },

  async invite(collaborator: { name: string; email: string; role?: string }) {
    const res = await fetch(`${BASE_URL}/invite`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(collaborator),
    });
    if (!res.ok) throw new Error("Error al invitar colaborador");
    return res.json();
  },

  async updateRole(id: number, role: string) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error("Error al actualizar rol");
    return res.json();
  },

  async remove(id: number) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar colaborador");
    return res.json();
  },
};
