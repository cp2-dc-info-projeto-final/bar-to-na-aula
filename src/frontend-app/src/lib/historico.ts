import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUser } from '$lib/auth'; // ajuste se o seu store de auth tiver outro path / shape

// Um item do Historico é uma comida OU uma bebida (nunca as duas).
// id_compra fica null até a compra ser efetivada no backend.
export interface hist {
  id: number;               // id local do item dentro do Historico (não é PK do banco)
  id_usuario: number | null;
  id_comida: number | null;
  id_bebida: number | null;
  id_compra: number | null;
  nome: string;
  preco: number;
  quantidade: number;
}

// O que a tela de cardápio/bebidas precisa informar ao adicionar um item.
export type ProdutoParaHistorico =
  | { tipo: 'comida'; id_comida: number; nome: string; preco: number }
  | { tipo: 'bebida'; id_bebida: number; nome: string; preco: number };

function storageKeyFor(user: any) {
  if (user && (user.id || user.email)) {
    const id = user.id ?? user.email;
    return `Historico_${id}`;
  }
  return 'Historico_guest';
}

let proximoIdLocal = 1;
function gerarIdLocal() {
  return proximoIdLocal++;
}

const internal: Writable<hist[]> = writable<hist[]>([]);
let currentKey = storageKeyFor(null);

/** Carrega o histórico do usuário informado (ou do convidado, se for null). */
export function trocarUsuarioHistorico(user: { id?: number | string; email?: string; login?: string } | null) {
  if (!browser) return;

  const id = user ? (user.id ?? user.email ?? user.login) : null;
  const newKey = id != null ? `Historico_${id}` : 'Historico_guest';
  if (newKey === currentKey) return;

  currentKey = newKey;
  try {
    const dataJson = sessionStorage.getItem(currentKey);
    const data: hist[] = dataJson ? JSON.parse(dataJson) : [];
    internal.set(data); // o subscribe de salvamento grava na chave nova
    proximoIdLocal = data.reduce((max, item) => Math.max(max, item.id + 1), 1);
  } catch (e) {
    console.error('Erro ao carregar Historico da sessionStorage:', e);
    internal.set([]);
  }
}

// API do store (compatível com writable)
export const Historico = {
  subscribe: internal.subscribe,
  set: (v: hist[]) => internal.set(v),
  update: (fn: (items: hist[]) => hist[]) => internal.update(fn)
};

// Funções para manipulação do Historico

/** Adiciona um produto (comida ou bebida) ao Historico. Se já existir, soma 1 na quantidade. */
export function adicionarAoHistorico(produto: ProdutoParaHistorico, id_usuario: number | null = null) {
  internal.update(items => {
    const existente = items.find(item =>
      (produto.tipo === 'comida' && item.id_comida === produto.id_comida) ||
      (produto.tipo === 'bebida' && item.id_bebida === produto.id_bebida)
    );

    if (existente) {
      return items.map(item =>
        item.id === existente.id ? { ...item, quantidade: item.quantidade + 1 } : item
      );
    }

    const novoItem: hist = {
      id: gerarIdLocal(),
      id_usuario,
      id_comida: produto.tipo === 'comida' ? produto.id_comida : null,
      id_bebida: produto.tipo === 'bebida' ? produto.id_bebida : null,
      id_compra: null,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1
    };
    return [...items, novoItem];
  });
}

/** Remove um item do Historico pelo id local (item.id, não id_comida/id_bebida). */
export function removerDoHistorico(id: number) {
  internal.update(items => items.filter(item => item.id !== id));
}

/** Atualiza a quantidade de um item; remove se a quantidade cair a 0 ou menos. */
export function atualizarQuantidade(id: number, quantidade: number) {
  if (quantidade <= 0) {
    removerDoHistorico(id);
    return;
  }
  internal.update(items => items.map(item => (item.id === id ? { ...item, quantidade } : item)));
}

export function limparHistorico() {
  internal.set([]);
}

// Stores derivadas reativas
export const totalItems = derived(internal, $items =>
  $items.reduce((sum, item) => sum + (item.quantidade || 0), 0)
);

export const totalPrice = derived(internal, $items =>
  $items.reduce((sum, item) => sum + item.preco * (item.quantidade || 0), 0)
);

// Funções compatíveis com código antigo (leitura pontual, fora de um contexto reativo)
export function getTotalItens() {
  let val = 0;
  const unsub = totalItems.subscribe(v => (val = v));
  unsub();
  return val;
}

/** Move os itens do carrinho para o Historico como uma compra efetivada. */
export function registrarCompra(
  itensCarrinho: { id_comida?: number | null; id_bebida?: number | null; nome: string; preco: number; quantidade: number }[],
  id_usuario: number | null = null
) {
  const id_compra = Date.now(); // provisório, até o backend devolver o id real

  internal.update(items => [
    ...items,
    ...itensCarrinho.map(c => ({
      id: gerarIdLocal(),
      id_usuario,
      id_comida: c.id_comida ?? null,
      id_bebida: c.id_bebida ?? null,
      id_compra,
      nome: c.nome,
      preco: c.preco,
      quantidade: c.quantidade
    }))
  ]);
}