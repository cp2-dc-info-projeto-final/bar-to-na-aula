export interface Reserva {
    id: number;
    id_mesa: number;
    identificacao: number;
    data: string; // "2026-11-20"
    horario: string; // "20:00"
    quantidade_pessoas: number;
    status: 'ativa' | 'cancelada';
    login?: string | null;
    artista?: string | null;
  }
  
  export interface MesaDisponivel {
    id: number;
    identificacao: number;
    tipo: 'com_show' | 'sem_show';
    artista: string | null;
    show_horario: string | null;
    reservada: boolean;
  }