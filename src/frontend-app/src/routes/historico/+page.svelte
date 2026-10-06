<script>
  import { Historico } from '$lib/historico';

  const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Agrupa os itens por id_compra (mais recente primeiro)
  let compras = $derived.by(() => {
    const mapa = new Map();

    for (const item of $Historico) {
      const chave = item.id_compra ?? 'sem-compra';
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(item);
    }

    return [...mapa.entries()]
      .map(([id_compra, itens]) => ({
        id_compra,
        itens,
        total: itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0)
      }))
      .sort((a, b) => {
        if (a.id_compra === 'sem-compra') return 1;
        if (b.id_compra === 'sem-compra') return -1;
        return b.id_compra - a.id_compra;
      });
  });

  function titulo(id_compra) {
    if (id_compra === 'sem-compra') return 'Itens sem compra';
    return new Date(id_compra).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  function removerCompra(id_compra) {
    Historico.update((items) =>
      items.filter((i) => (i.id_compra ?? 'sem-compra') !== id_compra)
    );
  }
</script>

<div class="bg-[#deb266] min-h-screen flex items-center justify-center p-4">
  <div class="bg-white text-black border-2 rounded-xl w-full max-w-md h-[32rem] flex flex-col p-4">

    <div class="flex items-center justify-between mb-2">
      <h1 class="font-semibold">Histórico de compras</h1>
      {#if compras.length > 0}
        <span class="bg-red-600 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
          {compras.length}
        </span>
      {/if}
    </div>

    <div class="flex-1 overflow-y-auto space-y-3">
      {#if compras.length === 0}
        <p class="text-sm text-gray-500 text-center mt-4">Seu histórico está vazio.</p>
      {:else}
        {#each compras as compra (compra.id_compra)}
          <div class="border rounded-lg p-3 bg-gray-50">

            <div class="flex items-center justify-between border-b pb-2 mb-2">
              <span class="text-sm font-semibold">{titulo(compra.id_compra)}</span>
              <button
                class="text-xs text-red-600"
                onclick={() => removerCompra(compra.id_compra)}
              >remover compra</button>
            </div>

            <ul class="divide-y">
              {#each compra.itens as item (item.id)}
                <li class="flex items-center justify-between gap-2 py-1.5">
                  <div>
                    <p class="text-sm">{item.nome}</p>
                    <p class="text-xs text-gray-500">{moeda(item.preco)} un.</p>
                  </div>
                  <span class="text-sm">x{item.quantidade}</span>
                </li>
              {/each}
            </ul>

            <div class="flex items-center justify-between border-t pt-2 mt-2">
              <span class="text-sm font-semibold">Total</span>
              <span class="text-sm font-semibold">{moeda(compra.total)}</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>