<script lang="ts">
    import { Card, Button, Badge } from 'flowbite-svelte';
    import ConfirmModal from './ConfirmModal.svelte';
    import { goto } from '$app/navigation';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
    import { onMount } from 'svelte';
    import type { Reser } from '$lib/models/Reser';
  
    let reservas = $state<Reser[]>([]);
    let loading = $state(true);
    let error = $state('');
    let cancelandoId = $state<number | null>(null);
    let confirmOpen = $state(false);
    let confirmTargetId = $state<number | null>(null);
  
    const formatarData = (d: string) => d.split('-').reverse().join('/');
  
    function mensagemDeErro(e: any, padrao: string): string {
      const body = e.response?.data as (ApiResponse<unknown> & { error?: string }) | undefined;
      if (!e.response) return 'Sem resposta do servidor (rede ou CORS).';
      if (e.response.status === 401) return 'Sessão expirada. Faça login novamente.';
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
      if (confirmTargetId !== null) cancelarReserva(confirmTargetId);
      closeConfirm();
    }
  
    async function cancelarReserva(id: number) {
      cancelandoId = id;
      error = '';
      try {
        const res = await api.delete(`/reser/${id}`);
        const body = res.data as ApiResponse<null>;
        if (!body.success) {
          error = body.message;
          return;
        }
        reservas = reservas.map((r) => (r.id === id ? { ...r, status: 'cancelada' } : r));
      } catch (e: any) {
        console.error('Erro ao cancelar reserva:', e);
        error = mensagemDeErro(e, 'Erro ao cancelar reserva.');
      } finally {
        cancelandoId = null;
      }
    }
  
    onMount(async () => {
      try {
        const res = await api.get('/reser');
        const body = res.data as ApiResponse<Reserva[]>;
        if (body.success) {
          reservas = body.data ?? [];
        } else {
          error = body.message;
        }
      } catch (e: any) {
        console.error('Erro ao carregar reservas:', e);
        error = mensagemDeErro(e, 'Erro ao carregar reservas.');
      } finally {
        loading = false;
      }
    });
  </script>
  
  {#if loading}
    <div class="my-8 text-center text-gray-500">Carregando reservas...</div>
  {:else}
    <div class="max-w-3xl mx-auto mt-8 px-2 flex items-center justify-between">
      <h3 class="text-2xl font-semibold">Reservas</h3>
      <Button onclick={() => goto('/reservas/new')}>Nova reserva</Button>
    </div>
  
    {#if error}
      <div class="my-4 text-center text-red-500">{error}</div>
    {/if}
  
    {#if reservas.length === 0 && !error}
      <div class="my-8 text-center text-gray-500">Nenhuma reserva encontrada.</div>
    {/if}
  
    <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
      {#each reservas as reserva (reserva.id)}
        <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
          <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800">Mesa {reserva.identificacao}</div>
              {#if reserva.login}
                <div class="text-xs text-gray-400">Cliente: {reserva.login}</div>
              {/if}
            </div>
            <Badge color={reserva.status === 'ativa' ? 'green' : 'gray'} class="text-xs">
              {reserva.status === 'ativa' ? 'Ativa' : 'Cancelada'}
            </Badge>
          </div>
          <div class="px-4 pb-4 pt-2 flex flex-col gap-1 text-left text-sm text-gray-700">
            <div>📅 {formatarData(reserva.data)} às {reserva.horario}</div>
            <div>👥 {reserva.quantidade_pessoas} pessoa(s)</div>
            {#if reserva.artista}
              <div>🎵 {reserva.artista}</div>
            {/if}
            {#if reserva.status === 'ativa'}
              <div class="mt-2">
                <Button
                  color="red"
                  size="sm"
                  disabled={cancelandoId === reserva.id}
                  onclick={() => openConfirm(reserva.id)}
                >
                  Cancelar reserva
                </Button>
              </div>
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  {/if}
  
  <ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja cancelar esta reserva?"
    confirmText="Cancelar reserva"
    cancelText="Voltar"
    onConfirm={handleConfirm}
    onCancel={closeConfirm}
  />