<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Button } from 'flowbite-svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import { EditOutline, TrashBinOutline } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
  import api from '$lib/api';
  import type { ApiResponse } from '$lib/api';
  import { onMount } from 'svelte';
  import type { Show } from '$lib/models/Shows';

  let shows = $state<Show[]>([]);
  let loading = $state(true);
  let error = $state('');
  let deletingId = $state<number | null>(null);
  let confirmOpen = $state(false);
  let confirmTargetId = $state<number | null>(null);
  let filtro = $state('');

  let timer: ReturnType<typeof setTimeout>;
  let requestSeq = 0; // ignora respostas antigas da busca

  const hora = (h: string) => h?.slice(0, 5) ?? '';

  function mensagemDeErro(e: any, padrao: string): string {
    const body = e.response?.data as (ApiResponse<unknown> & { error?: string }) | undefined;
    if (!e.response) return 'Sem resposta do servidor (rede ou CORS).';
    if (e.response.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (e.response.status === 403) return 'Você não tem permissão de administrador para esta ação.';
    return body?.message || body?.error || padrao;
  }

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
      error = mensagemDeErro(e, 'Erro ao remover show.');
    } finally {
      deletingId = null;
    }
  }

  async function carregarShows() {
    const seq = ++requestSeq;
    try {
      const res = await api.get(`/shows?nome=${encodeURIComponent(filtro)}`);
      if (seq !== requestSeq) return;
      const body = res.data as ApiResponse<Show[]>;
      if (body.success) {
        shows = body.data ?? [];
        error = '';
      } else {
        error = body.message;
      }
    } catch (e: any) {
      if (seq !== requestSeq) return;
      console.error('Erro ao carregar shows:', e);
      error = mensagemDeErro(e, 'Erro ao carregar shows');
    } finally {
      if (seq === requestSeq) loading = false;
    }
  }

  function onFiltroInput() {
    clearTimeout(timer);
    timer = setTimeout(carregarShows, 300);
  }

  onMount(() => {
    carregarShows();
    return () => clearTimeout(timer);
  });
</script>

{#if loading}
  <div class="my-8 text-center text-gray-500">Carregando shows...</div>
{:else}
  <!-- Pesquisa + novo show -->
  <div class="max-w-5xl mx-auto mt-8 px-2 flex gap-2">
    <input
      type="text"
      id="pesquisa"
      class="flex-1 rounded border border-gray-300 bg-white p-2"
      placeholder="Digite o nome do artista..."
      bind:value={filtro}
      oninput={onFiltroInput}
    />
    <Button onclick={() => goto('/shows/new')}>Novo show</Button>
  </div>

  {#if error}
    <div class="my-4 text-center text-red-500">{error}</div>
  {/if}

  {#if shows.length === 0 && !error}
    <div class="my-8 text-center text-gray-500">Nenhum show encontrado.</div>
  {/if}

  <!-- Tabela para telas grandes -->
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
                  type="button"
                  class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                  title="Editar"
                  onclick={() => goto(`/shows/edit/${show.id}`)}
                >
                  <EditOutline class="w-5 h-5 text-primary-500" />
                </button>
                <button
                  type="button"
                  title="Remover"
                  class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                  onclick={() => openConfirm(show.id)}
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
                type="button"
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                onclick={() => goto(`/shows/edit/${show.id}`)}
              >
                <EditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <button
                type="button"
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                onclick={() => openConfirm(show.id)}
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