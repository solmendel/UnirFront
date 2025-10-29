export interface Collaborator {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const BASE_URL = "http://localhost:3001/api/collaborators";

export const collaboratorService = {
  async getAll(): Promise<Collaborator[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Error al obtener colaboradores");
    return res.json();
  },

  async invite(collaborator: { name: string; email: string; role?: string }) {
    const res = await fetch(`${BASE_URL}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collaborator),
    });
    if (!res.ok) throw new Error("Error al invitar colaborador");
    return res.json();
  },

  async updateRole(id: number, role: string) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error("Error al actualizar rol");
    return res.json();
  },

  async remove(id: number) {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar colaborador");
    return res.json();
  },
};
