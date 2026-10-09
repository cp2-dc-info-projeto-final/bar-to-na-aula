<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Button } from 'flowbite-svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
  import api from '$lib/api';
  import type { ApiResponse } from '$lib/api';
  import { onMount } from 'svelte';
  import type { Show } from '$lib/models/Show';

  let shows: Show[] = [];
  let loading = true;
  let error = '';
  let deletingId: number | null = null;
  let confirmOpen = false;
  let confirmTargetId: number | null = null;
  let filtro = '';
  let timer: ReturnType<typeof setTimeout>;

  const hora = (h: string) => h?.slice(0, 5) ?? '';

  function openConfirm(id: number) {
    confirmTargetId = id;
    confirmOpen = true;
  }
  function closeConfirm() {
    confirmOpen = false;
    confirmTargetId = null;
  }
  function handleConfirm() {
    if (confirmTargetId !== null) handleDelete(confirmTargetId);
    closeConfirm();
  }

  async function handleDelete(id: number) {
    deletingId = id;
    error = '';
    try {
      const res = await api.delete(`/shows/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message;
        return;
      }
      shows = shows.filter((s) => s.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar show:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover show.';
    } finally {
      deletingId = null;
    }
  }

  async function carregarShows() {
    try {
      const res = await api.get(`/shows?nome=${encodeURIComponent(filtro)}`);
      const body = res.data as ApiResponse<Show[]>;
      if (body.success) {
        shows = body.data ?? [];
        error = '';
      } else {
        error = body.message;
      }
    } catch (e: any) {
      console.error('Erro ao carregar shows:', e);
      const body = e.response?.data as ApiResponse<Show[]> | undefined;
      error = body?.message || 'Erro ao carregar shows';
    } finally {
      loading = false;
    }
  }

  // espera o usuário parar de digitar antes de buscar
  function onFiltroInput() {
    clearTimeout(timer);
    timer = setTimeout(carregarShows, 300);
  }

  onMount(carregarShows);
</script>

{#if loading}
  <div class="my-8 text-center text-gray-500">Carregando shows...</div>
{:else}
  <div class="max-w-5xl mx-auto mt-8 px-2 flex gap-2">
    <input
      type="text"
      id="pesquisa"
      class="flex-1 rounded border border-gray-300 p-2"
      placeholder="Digite o nome do artista..."
      bind:value={filtro}
      on:input={onFiltroInput}
    />
    <Button onclick={() => goto('/shows/new')}>Novo show</Button>
  </div>

  {#if error}
    <div class="my-4 text-center text-red-500">{error}</div>
  {/if}

  <!-- Tabela para telas médias/grandes -->
  <div class="hidden xl:block">
    <Table class="w-full max-w-5xl mx-auto my-8 shadow-lg border border-gray-200">
      <TableHead>
        <TableHeadCell class="w-16">ID</TableHeadCell>
        <TableHeadCell>Artista</TableHeadCell>
        <TableHeadCell class="w-32">Horário</TableHeadCell>
        <TableHeadCell>Gênero</TableHeadCell>
        <TableHeadCell class="w-24"></TableHeadCell>
      </TableHead>
      <TableBody>
        {#each shows as show (show.id)}
          <TableBodyRow>
            <TableBodyCell>{show.id}</TableBodyCell>
            <TableBodyCell>{show.artista}</TableBodyCell>
            <TableBodyCell>{hora(show.horario)}</TableBodyCell>
            <TableBodyCell>{show.genero}</TableBodyCell>
            <TableBodyCell>
              <div class="flex gap-2">
                <button
                  class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                  title="Editar"
                  on:click={() => goto(`/shows/edit/${show.id}`)}
                >
                  <UserEditOutline class="w-5 h-5 text-primary-500" />
                </button>
                <button
                  title="Remover"
                  class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                  on:click={() => openConfirm(show.id)}
                  disabled={deletingId === show.id}
                >
                  <TrashBinOutline class="w-5 h-5 text-red-400" />
                </button>
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Cards para telas pequenas -->
  <div class="block xl:hidden">
    <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
      {#each shows as show (show.id)}
        <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
          <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800">{show.artista}</div>
              <div class="text-xs text-gray-400">ID: {show.id}</div>
            </div>
            <div class="flex gap-2">
              <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/shows/edit/${show.id}`)}
              >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(show.id)}
                disabled={deletingId === show.id}
              >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          <div class="px-4 pb-4 pt-2 flex flex-col gap-1 text-left text-sm text-gray-700">
            <div>🕘 {hora(show.horario)}</div>
            <div>🎵 {show.genero}</div>
          </div>
        </Card>
      {/each}
    </div>
  </div>
{/if}

<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover este show?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={closeConfirm}
/>