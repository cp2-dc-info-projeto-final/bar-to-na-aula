export interface Com {
    id: number;
    nome: string;
    preço: number;
    marca: string;
    tamanho: string;
    tipo: string;
}

export interface ComFormData {
    id: number;
    nome: string;
    preço: string;
    marca: string;
    tamanho: string;
    tipo: string;
}

// alterar as informaçoes usando as infos do create
