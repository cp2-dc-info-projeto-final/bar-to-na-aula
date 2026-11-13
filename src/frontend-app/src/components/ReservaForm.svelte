<script lang="ts">
    import { Card, Button, Label, Badge } from 'flowbite-svelte';
    import ConfirmModal from './ConfirmModal.svelte';
    import { ArrowLeftOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
    import type { MesaDisponivel } from '$lib/models/Reserva';
  
    // Mesma lista do backend (routes/reservas.js)
    const HORARIOS = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  
    // Data de hoje no fuso do navegador (YYYY-MM-DD)
    const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  
    let data = $state(hoje);
    let horario = $state('');
    let pessoas = $state(2);
    let mesas = $state<MesaDisponivel[]>([]);
    let loadingMesas = $state(false);
    let salvando = $state(false);
    let error = $state('');
    let confirmOpen = $state(false);
    let mesaAlvo = $state<MesaDisponivel | null>(null);
  
    let requestSeq = 0; // ignora respostas antigas
  
    const formatarData = (d: string) => d.split('-').reverse().join('/');
  
    function mensagemDeErro(e: any, padrao: string): string {
      const body = e.response?.data as (ApiResponse<unknown> & { error?: string }) | undefined;
      if (!e.response) return 'Sem resposta do servidor (rede ou CORS).';
      if (e.response.status === 401) return 'Sessão expirada. Faça login novamente.';
      return body?.message || body?.error || padrao;
    }
  
    async function carregarMesas() {
      if (!data || !horario) {
        mesas = [];
        return;
      }
      const seq = ++requestSeq;
      loadingMesas = true;
      error = '';
      try {
        const res = await api.get(`/reser/disponibilidade?data=${data}&horario=${horario}`);
        if (seq !== requestSeq) return;
        const body = res.data as ApiResponse<MesaDisponivel[]>;
        if (body.success) {
          mesas = body.data ?? [];
        } else {
          error = body.message;
        }
      } catch (e: any) {
        if (seq !== requestSeq) return;
        console.error('Erro ao carregar mesas:', e);
        error = mensagemDeErro(e, 'Erro ao carregar mesas.');
      } finally {
        if (seq === requestSeq) loadingMesas = false;
      }
    }
  
    function abrirConfirmacao(mesa: MesaDisponivel) {
      if (!pessoas || pessoas < 1 || pessoas > 12) {
        error = 'Informe de 1 a 12 pessoas.';
        return;
      }
      error = '';
      mesaAlvo = mesa;
      confirmOpen = true;
    }
  
    function cancelarConfirmacao() {
      confirmOpen = false;
      mesaAlvo = null;
    }
  
    async function confirmarReserva() {
      const mesa = mesaAlvo;
      confirmOpen = false;
      if (!mesa) return;
  
      salvando = true;
      error = '';
      let ok = false;
      try {
        const res = await api.post('/reser', {
          id_mesa: mesa.id,
          data,
          horario,
          quantidade_pessoas: pessoas
        });
        const body = res.data as ApiResponse<unknown>;
        if (!body.success) {
          error = body.message;
        } else {
          ok = true;
        }
      } catch (e: any) {
        console.error('Erro ao reservar:', e);
        error = mensagemDeErro(e, 'Erro ao reservar mesa.');
        if (e.response?.status === 409) await carregarMesas(); // alguém reservou antes
      } finally {
        salvando = false;
        mesaAlvo = null;
      }
  
      if (ok) await goto('/reservas');
    }
  </script>
  
  <div class="max-w-3xl mx-auto mt-8 px-2">
    <h3 class="mb-4 text-center text-2xl font-semibold">Reservar mesa</h3>
  
    <!-- Filtros -->
    <Card class="max-w-none w-full p-6 shadow-lg border border-gray-200">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label for="data">Data</Label>
          <input
            id="data"
            type="date"
            min={hoje}
            class="mt-1 w-full rounded border border-gray-300 bg-white p-2"
            bind:value={data}
            onchange={carregarMesas}
          />
        </div>
        <div>
          <Label for="horario">Horário</Label>
          <select
            id="horario"
            class="mt-1 w-full rounded border border-gray-300 bg-white p-2"
            bind:value={horario}
            onchange={carregarMesas}
          >
            <option value="">Escolha...</option>
            {#each HORARIOS as h}
              <option value={h}>{h}</option>
            {/each}
          </select>
        </div>
        <div>
          <Label for="pessoas">Pessoas</Label>
          <input
            id="pessoas"
            type="number"
            min="1"
            max="12"
            class="mt-1 w-full rounded border border-gray-300 bg-white p-2"
            bind:value={pessoas}
          />
        </div>
      </div>
    </Card>
  
    {#if error}
      <div class="my-4 text-center text-red-500">{error}</div>
    {/if}
  
    <!-- Mesas -->
    {#if !horario}
      <div class="my-8 text-center text-gray-500">Escolha a data e o horário para ver as mesas.</div>
    {:else if loadingMesas}
      <div class="my-8 text-center text-gray-500">Carregando mesas...</div>
    {:else if mesas.length === 0 && !error}
      <div class="my-8 text-center text-gray-500">Nenhuma mesa cadastrada.</div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
        {#each mesas as mesa (mesa.id)}
          <Card class="max-w-none w-full p-0 overflow-hidden shadow-lg border border-gray-200">
            <div class="px-4 pt-4 pb-2 bg-gray-100 flex items-center justify-between">
              <div class="text-lg font-semibold text-gray-800">Mesa {mesa.identificacao}</div>
              <Badge color={mesa.reservada ? 'red' : 'green'} class="text-xs">
                {mesa.reservada ? 'Ocupada' : 'Livre'}
              </Badge>
            </div>
            <div class="px-4 py-3 flex flex-col gap-2 text-sm text-gray-700">
              {#if mesa.tipo === 'com_show'}
                <div>🎵 {mesa.artista} às {mesa.show_horario}</div>
              {:else}
                <div class="text-gray-400">Mesa sem show</div>
              {/if}
              <Button
                disabled={mesa.reservada || salvando}
                onclick={() => abrirConfirmacao(mesa)}
              >
                {mesa.reservada ? 'Indisponível' : 'Reservar'}
              </Button>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  
    <div class="flex justify-start mb-8">
      <Button color="light" type="button" onclick={() => goto('/reservas')}>
        <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
        Voltar
    </Button>
    </div>
</div>

<ConfirmModal
    open={confirmOpen}
    message={mesaAlvo
    ? `Reservar a mesa ${mesaAlvo.identificacao} para ${formatarData(data)} às ${horario}, para ${pessoas} pessoa(s)?`
: ''}
    confirmText="Reservar"
    cancelText="Cancelar"
    onConfirm={confirmarReserva}
    onCancel={cancelarConfirmacao}
/>