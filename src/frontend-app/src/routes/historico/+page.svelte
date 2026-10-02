<script>
    import {  histori, removerDoHistorico, atualizarQuantidade, totalItems, totalPrice } from '$lib/historico';
</script>

<div class="bg-[#deb266] h-screen"><br><br><br><br><br><br>
    <div class="bg-[#ffffff] text-[#000000] border-2 rounded-xl h-150 w-150 ml-auto mr-auto">

         {#if $totalItems > 0}
        <span class=" text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {$totalItems}
        </span>
            {/if}
       
        <div class="card h-200 w-100 flex flex-col p-4">
            <!-- .lista de itens adicionados ao historico. -->
            <div class="flex-1 overflow-y-auto">
              {#if $histori.length === 0}
                <p class="text-sm text-gray-500 text-center mt-4">Seu historico está vazio.</p>
              {:else} 

                <ul class="divide-y">
                  {#each $histori as item (item.id)}
                    <li class="flex items-center justify-between gap-2 py-2">
                      <div>
                        <p class="text-sm text-[#000000]">{item.nome}</p>
                      </div>
  
                      <div class="flex items-center gap-2">
                        <button
                          class="w-6 h-6 border rounded flex items-center justify-center"
                          on:click={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                        >
                          -
                        </button>
                        <span class="text-sm w-4 text-center">{item.quantidade}</span>
                        <button
                          class="w-6 h-6 border rounded flex items-center justify-center"
                          on:click={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                        >
                          +
                        </button>
                        <button
                          class="text-xs text-red-600 ml-2"
                          on:click={() => removerDoHistorico(item.id)}
                        >
                          remover
                        </button>
                      </div>
                    </li>
                  {/each}
                </ul> 
  
                <div class="flex items-center justify-between border-t pt-2 mt-2">
                  <span class="text-sm font-semibold text-[#000000]">Total</span>
                </div>
              {/if} 
            </div>
          </div>
    </div>
</div>