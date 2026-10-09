// $lib/models/Show.ts
export interface Show {
  id: number;
  artista: string;
  horario: string; // "21:00:00" vindo do Postgres
  genero: string;
}

export interface ShowFormData {
  artista: string;
  horario: string; // "21:00"
  genero: string;
}