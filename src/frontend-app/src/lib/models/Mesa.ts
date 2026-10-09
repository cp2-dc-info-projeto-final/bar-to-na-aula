// $lib/models/Mesa.ts
export type TipoMesa = 'com_show' | 'sem_show';

export interface Mesa {
  id: number;
  identificacao: number;
  tipo: TipoMesa;
  id_show: number | null;
  artista: string | null;
  horario: string | null;
  genero: string | null;
}

export interface MesaFormData {
  identificacao: number | null;
  tipo: TipoMesa;
  id_show: number | null;
}