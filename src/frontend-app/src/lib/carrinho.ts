import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUser } from '$lib/auth'; // ajuste se o seu store de auth tiver outro path / shape



export interface item_carrinho {
id: number;
id_usuario: number;
id_comida: number;
id_bebida: number;
id_compra: number; 
quantidade: number;
}

function storageKeyFor(user: any) {
if (user && (user.id  || user.email)) {
    const id = user.id ?? user.email;
    return `carrinho_${id}`;
}
return 'carrinho_guest';
}

const internal: Writable< item_carrinho []> = writable< item_carrinho []>([]);
let currentKey = storageKeyFor(null);

if (browser) {
  // Inicializa a partir do sessionStorage (sem qualquer migração de localStorage)
try {
    const initialJson = sessionStorage.getItem(currentKey);
    const initial = initialJson ? JSON.parse(initialJson) : [];
    internal.set(initial);
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
}

// Quando o usuário loga/desloga, trocamos a chave e carregamos apenas o que existir
if (browser) {
  currentUser.subscribe(user => {
    const newKey = storageKeyFor(user);
    if (newKey === currentKey) return;

    currentKey = newKey;
    try {
    const dataJson = sessionStorage.getItem(currentKey);
    const data = dataJson ? JSON.parse(dataJson) : [];
    internal.set(data);
    } catch (e) {
    console.error('Erro ao carregar carrinho da sessionStorage:', e);
    internal.set([]);
    }
});
}

// API do store (compatible com writable)
export const carrinho = {
subscribe: internal.subscribe,
set: (v: item_carrinho[]) => internal.set(v),
update: (fn: (items: item_carrinho[]) => item_carrinho[]) => internal.update(fn)
};
// mudar preoduto para ?????
// Funções para manipulação do carrinho
export function adicionarAoCarrinho(produto: Omit<item_carrinho, 'quantidade'>) {
  internal.update(items => {
    const itemExistente = items.find(item => (item.id === item.id_bebida) || (item.id === item.id_comida));
    if (itemExistente) {
      return items.map(item =>
        (item.id === item.id_bebida) || (item.id === item.id_comida) ? { ...item, quantidade: item.quantidade + 1 } : item
      );
    } else {
      return [...items, { ...produto, quantidade: 1 }];
    }
  });
}

export function removerDoCarrinho(id: number) {
  internal.update(items => items.filter(item => item.id !== id));
}

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
// mudar para o valor da compra )))))
export const totalPrice = derived(internal, $items =>
  $items.reduce((sum, item) => {
    const precoNum = parseFloat(String(item.id_compra).replace(',', '.')) || 0;
    return sum + precoNum * (item.quantidade || 0);
  }, 0)
);

// Funções compatíveis com código antigo
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