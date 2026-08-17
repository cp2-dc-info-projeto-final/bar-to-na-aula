<script lang="ts">
    // Tabela de usuários
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge } from 'flowbite-svelte'; // UI
    import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
    import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
    import { goto } from '$app/navigation'; // navegação
    import api from '$lib/api'; // API backend
    import type { ApiResponse } from '$lib/api';
    import { onMount } from 'svelte'; // ciclo de vida
    import type { Beb } from '$lib/models/Beb';

    let bebidas: Beb[] = []
    let loading = true;
    let error = '';
    let deletingId: number | null = null; // id em deleção
    let confirmOpen = false; // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal
    let filtro = '';
  
    // Abre modal de confirmação
    function openConfirm(id: number) {
      confirmTargetId = id;
      confirmOpen = true;
    }
    // Fecha modal
    function closeConfirm() {
      confirmOpen = false;
      confirmTargetId = null;
    }
  
    // Confirma remoção
    function handleConfirm() {
      if (confirmTargetId !== null) {
        handleDelete(confirmTargetId);
      }
      closeConfirm();
    }
  
    // Cancela remoção
    function handleCancel() {
      closeConfirm();
    }
  
    async function handleDelete(id: number) {
      deletingId = id;
      error = '';
      try {
        const res = await api.delete(`/bebida/${id}`);
        const body = res.data as ApiResponse<null>;
        if (!body.success) {
          error = body.message;
          return;
        }
        bebidas = bebidas.filter(bebida => bebida.id !== id);
    } catch (e: any) {
        console.error('Erro ao deletar produto:', e);
        const body = e.response?.data as ApiResponse<null> | undefined;
        error = body?.message || 'Erro ao remover produto.';
    } finally {
        deletingId = null;
    }
    }
    
    onMount(async () => {
    try {
        const res = await api.get('/beb');
        const body = res.data as ApiResponse<Beb[]>;

        if (body.success) {
            bebidas = body.data ?? [];
        } else {
            error = body.message;
        }
    } catch (e: any) {
        console.error('Erro ao carregar produtos:', e);

        const body = e.response?.data as ApiResponse<Beb[]> | undefined;

        error = body?.message || 'Erro ao carregar produtos';
    } finally {
        loading = false;
    }
});

    async function carregarBebidas() {
    try {
        console.log("filtro: ", filtro);
        const res = await api.get(`/bebidas?nome=${encodeURIComponent(filtro)}`);
        const body = res.data as ApiResponse<Beb[]>;
        if (body.success) {
            bebidas = body.data ?? [];
        } else {
        error = body.message;
        }
    } catch (e: any) {
        console.error('Erro ao carregar produtos:', e);
        const body = e.response?.data as ApiResponse<Beb[]> | undefined;
        error = body?.message || 'Erro ao carregar produtos';
      } finally {
        loading = false;
      }
    }
    
</script>

{#if loading}
    <div class="my-8 text-center text-gray-500">Carregando produtos...</div>
{:else if error}
    <div class="my-8 text-center text-red-500">{error}</div>
{:else}
    <!-- Tabela para telas médias/grandes -->
    <div class="hidden xl:block">
    <div class="filtro">
        <input type="text" id="pesquisa" placeholder="Digite o nome do Usuário..." bind:value={filtro}  on:input={carregarBebidas} />

    </div>
    <!-- Tabela de usuários -->
    <Table class="w-full max-w-5xl mx-auto my-8 shadow-lg border border-gray-200 rounded-full">
        <TableHead>
        <TableHeadCell class="w-16 ">ID</TableHeadCell>
        <TableHeadCell class="w-32">Nome</TableHeadCell>
        <TableHeadCell class="min-w-0">Preço</TableHeadCell>
        <TableHeadCell class="w-20">Marca</TableHeadCell>
        <TableHeadCell class="min-w-0">Tamanho</TableHeadCell>
        <TableHeadCell class="w-20">Tipo</TableHeadCell>
        <TableHeadCell class="w-24"></TableHeadCell> <!-- coluna para editar/remover -->
        </TableHead>
        <TableBody>
        {#each bebidas as alcolico}
            <TableBodyRow>
            <TableBodyCell>{alcolico.id}</TableBodyCell>
            <TableBodyCell>{alcolico.nome}</TableBodyCell>

            <!-- <TableBodyCell class="truncate max-w-0">{alcolico.email}</TableBodyCell> -->

            <TableBodyCell>{alcolico.marca}</TableBodyCell>
            <TableBodyCell>{alcolico.tamanho}</TableBodyCell>

            <TableBodyCell>
                <Badge color={alcolico.tipo === 'alcolico' ? 'red' : 'blue'} class="text-xs">
                {alcolico.tipo}
                </Badge>
            </TableBodyCell>

            <TableBodyCell>
                <!-- Botão editar -->
                <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/bebida/edit/${alcolico.id}`)}
                >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
                </button>
                <!-- Botão remover -->
                <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(alcolico.id)}
                disabled={deletingId === alcolico.id || loading}
                >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
                </button>
            </TableBodyCell>
            </TableBodyRow>
        {/each}
        </TableBody>
      </Table>
    </div>
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
      <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
        {#each bebidas as alcolico}
          <!-- Card de usuário -->
          <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
            <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
              <div>
                <div class="text-lg font-semibold text-gray-800 text-left">{alcolico.nome}</div>
                <div class="text-xs text-gray-400 text-left">ID: {alcolico.id}</div>
                <Badge color={alcolico.tipo === 'admin' ? 'red' : 'blue'} class="text-xs mt-1">
                  {alcolico.tipo}
                </Badge>
              </div>
              <div class="flex gap-2">
                <!-- Botão editar -->
                <button
                  class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                  title="Editar"
                  on:click={() => goto(`/users/edit/${alcolico.id}`)}
                >
                  <UserEditOutline class="w-5 h-5 text-primary-500" />
                </button>
                <!-- Botão remover -->
                <button
                  title="Remover"
                  class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                  on:click={() => openConfirm(alcolico.id)}
                  disabled={deletingId === alcolico.id || loading}
                >
                  <TrashBinOutline class="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
            <div class="px-4 pb-4 pt-2 flex flex-col gap-2 text-left">
              <div class="flex items-center gap-2 text-left">
                <!-- Ícone de email -->
                <svg class="w-4 h-4 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12A4 4 0 1 0 8 12a4 4 0 0 0 8 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7m-7-7v7m14-7v7"/></svg>
                <span class="text-gray-700 text-sm">{alcolico.preço}</span>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Modal de confirmação -->
  <ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja remover este usuário?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={handleCancel}
  />
  