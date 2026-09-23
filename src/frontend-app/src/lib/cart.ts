import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUser } from '$lib/auth'; // ajuste se o seu store de auth tiver outro path / shape

// Um item do carrinho é uma comida OU uma bebida (nunca as duas).
// id_compra fica null até a compra ser efetivada no backend.
export interface ItemCarrinho {
  id: number;               // id local do item dentro do carrinho (não é PK do banco)
  id_usuario: number | null;
  id_comida: number | null;
  id_bebida: number | null;
  id_compra: number | null;
  nome: string;
  preco: number;
  quantidade: number;
}

// O que a tela de cardápio/bebidas precisa informar ao adicionar um item.
export type ProdutoParaCarrinho =
  | { tipo: 'comida'; id_comida: number; nome: string; preco: number }
  | { tipo: 'bebida'; id_bebida: number; nome: string; preco: number };

function storageKeyFor(user: any) {
  if (user && (user.id || user.email)) {
    const id = user.id ?? user.email;
    return `carrinho_${id}`;
  }
  return 'carrinho_guest';
}

let proximoIdLocal = 1;
function gerarIdLocal() {
  return proximoIdLocal++;
}

const internal: Writable<ItemCarrinho[]> = writable<ItemCarrinho[]>([]);
let currentKey = storageKeyFor(null);

if (browser) {
  // Inicializa a partir do sessionStorage (sem qualquer migração de localStorage)
  try {
    const initialJson = sessionStorage.getItem(currentKey);
    const initial: ItemCarrinho[] = initialJson ? JSON.parse(initialJson) : [];
    internal.set(initial);

    // ajusta o contador de ids locais pra não colidir com o que já estava salvo
    proximoIdLocal = initial.reduce((max, item) => Math.max(max, item.id + 1), 1);
  } catch (e) {
    console.error('Erro ao ler sessionStorage do carrinho:', e);
    internal.set([]);
  }

  // Sempre salva no sessionStorage atual quando o store mudar
  internal.subscribe(items => {
    try {
      sessionStorage.setItem(currentKey, JSON.stringify(items));
    } catch (e) {
      console.error('Erro ao salvar carrinho em sessionStorage:', e);
    }
  });

  // Quando o usuário loga/desloga, trocamos a chave e carregamos apenas o que existir
  currentUser.subscribe(user => {
    const newKey = storageKeyFor(user);
    if (newKey === currentKey) return;

    currentKey = newKey;
    try {
      const dataJson = sessionStorage.getItem(currentKey);
      const data: ItemCarrinho[] = dataJson ? JSON.parse(dataJson) : [];
      internal.set(data);
      proximoIdLocal = data.reduce((max, item) => Math.max(max, item.id + 1), 1);
    } catch (e) {
      console.error('Erro ao carregar carrinho da sessionStorage:', e);
      internal.set([]);
    }
  });
}

// API do store (compatível com writable)
export const carrinho = {
  subscribe: internal.subscribe,
  set: (v: ItemCarrinho[]) => internal.set(v),
  update: (fn: (items: ItemCarrinho[]) => ItemCarrinho[]) => internal.update(fn)
};

// Funções para manipulação do carrinho

/** Adiciona um produto (comida ou bebida) ao carrinho. Se já existir, soma 1 na quantidade. */
export function adicionarAoCarrinho(produto: ProdutoParaCarrinho, id_usuario: number | null = null) {
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

    const novoItem: ItemCarrinho = {
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

/** Remove um item do carrinho pelo id local (item.id, não id_comida/id_bebida). */
export function removerDoCarrinho(id: number) {
  internal.update(items => items.filter(item => item.id !== id));
}

/** Atualiza a quantidade de um item; remove se a quantidade cair a 0 ou menos. */
export function atualizarQuantidade(id: number, quantidade: number) {
  if (quantidade <= 0) {
    removerDoCarrinho(id);
    return;
  }
  internal.update(items => items.map(item => (item.id === id ? { ...item, quantidade } : item)));
}

export function limparCarrinho() {
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

export function getTotalPreco() {
  let val = 0;
  const unsub = totalPrice.subscribe(v => (val = v));
  unsub();
  return val;
}