<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge, Button } from 'flowbite-svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
  import api from '$lib/api';
  import type { ApiResponse } from '$lib/api';
  import { onMount } from 'svelte';
  import type { Mesa } from '$lib/models/Mesa';

  let mesas: Mesa[] = [];
  let loading = true;
  let error = '';
  let deletingId: number | null = null;
  let confirmOpen = false;
  let confirmTargetId: number | null = null;
  let filtro = '';
  let tipo = '';
  let timer: ReturnType<typeof setTimeout>;

  const hora = (h: string | null) => h?.slice(0, 5) ?? '';

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
      const res = await api.delete(`/mesa/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message;
        return;
      }
      mesas = mesas.filter((m) => m.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar mesa:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover mesa.';
    } finally {
      deletingId = null;
    }
  }

  async function carregarMesas() {
    try {
      const params = new URLSearchParams();
      if (filtro) params.set('nome', filtro);
      if (tipo) params.set('tipo', tipo);
      const res = await api.get(`/mesa?${params.toString()}`);
      const body = res.data as ApiResponse<Mesa[]>;
      if (body.success) {
        mesas = body.data ?? [];
        error = '';
      } else {
        error = body.message;
      }
    } catch (e: any) {
      console.error('Erro ao carregar mesas:', e);
      const body = e.response?.data as ApiResponse<Mesa[]> | undefined;
      error = body?.message || 'Erro ao carregar mesas';
    } finally {
      loading = false;
    }
  }

  function onFiltroInput() {
    clearTimeout(timer);
    timer = setTimeout(carregarMesas, 300);
  }

  onMount(carregarMesas);
</script>

{#if loading}
  <div class="my-8 text-center text-gray-500">Carregando mesas...</div>
{:else}
  <div class="max-w-5xl mx-auto mt-8 px-2 flex flex-wrap gap-2">
    <input
      type="text"
      id="pesquisa"
      class="flex-1 min-w-48 rounded border border-gray-300 p-2"
      placeholder="Número da mesa ou artista..."
      bind:value={filtro}
      on:input={onFiltroInput}
    />
    <select bind:value={tipo} on:change={carregarMesas} class="rounded border border-gray-300 p-2">
      <option value="">Todas</option>
      <option value="com_show">Com show</option>
      <option value="sem_show">Sem show</option>
    </select>
    <Button onclick={() => goto('/mesa/new')}>Nova mesa</Button>
  </div>

  {#if error}
    <div class="my-4 text-center text-red-500">{error}</div>
  {/if}

  <!-- Tabela para telas médias/grandes -->
  <div class="hidden xl:block">
    <Table class="w-full max-w-5xl mx-auto my-8 shadow-lg border border-gray-200">
      <TableHead>
        <TableHeadCell class="w-16">ID</TableHeadCell>
        <TableHeadCell class="w-28">Mesa</TableHeadCell>
        <TableHeadCell class="w-32">Tipo</TableHeadCell>
        <TableHeadCell>Show</TableHeadCell>
        <TableHeadCell class="w-24"></TableHeadCell>
      </TableHead>
      <TableBody>
        {#each mesas as mesa (mesa.id)}
          <TableBodyRow>
            <TableBodyCell>{mesa.id}</TableBodyCell>
            <TableBodyCell>{mesa.identificacao}</TableBodyCell>
            <TableBodyCell>
              <Badge color={mesa.tipo === 'com_show' ? 'purple' : 'green'} class="text-xs">
                {mesa.tipo === 'com_show' ? 'Com show' : 'Sem show'}
              </Badge>
            </TableBodyCell>
            <TableBodyCell>
              {#if mesa.tipo === 'com_show'}
                {mesa.artista} · {hora(mesa.horario)} · {mesa.genero}
              {:else}
                <span class="text-gray-400">—</span>
              {/if}
            </TableBodyCell>
            <TableBodyCell>
              <div class="flex gap-2">
                <button
                  class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                  title="Editar"
                  on:click={() => goto(`/mesa/edit/${mesa.id}`)}
                >
                  <UserEditOutline class="w-5 h-5 text-primary-500" />
                </button>
                <button
                  title="Remover"
                  class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                  on:click={() => openConfirm(mesa.id)}
                  disabled={deletingId === mesa.id}
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
      {#each mesas as mesa (mesa.id)}
        <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
          <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800">Mesa {mesa.identificacao}</div>
              <Badge color={mesa.tipo === 'com_show' ? 'purple' : 'green'} class="text-xs mt-1">
                {mesa.tipo === 'com_show' ? 'Com show' : 'Sem show'}
              </Badge>
            </div>
            <div class="flex gap-2">
              <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/mesa/edit/${mesa.id}`)}
              >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(mesa.id)}
                disabled={deletingId === mesa.id}
              >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          <div class="px-4 pb-4 pt-2 text-left text-sm text-gray-700">
            {#if mesa.tipo === 'com_show'}
              <div class="font-medium">{mesa.artista}</div>
              <div>{hora(mesa.horario)} · {mesa.genero}</div>
            {:else}
              <div class="text-gray-400">Sem apresentação.</div>
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  </div>
{/if}

<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover esta mesa?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={closeConfirm}
/>