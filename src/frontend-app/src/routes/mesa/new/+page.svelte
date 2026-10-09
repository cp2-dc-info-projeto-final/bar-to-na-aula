<script lang="ts">
    import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import { goto } from '$app/navigation';
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons';
    import type { Mesa, MesaFormData } from '$lib/models/Mesa';
    import type { Show } from '$lib/models/Show';
  
    export let id: number | null = null; // null = cadastro, número = edição
  
    let mesa: MesaFormData = { identificacao: null, tipo: 'sem_show', id_show: null };
    let shows: Show[] = [];
  
    const tipoOptions = [
      { value: 'sem_show', name: 'Sem show' },
      { value: 'com_show', name: 'Com show' }
    ];
  
    let loading = false;
    let error = '';
    let fieldErrors: ApiFieldError[] = [];
  
    $: showOptions = shows.map((s) => ({
      value: s.id,
      name: `${s.artista} · ${s.horario?.slice(0, 5)}`
    }));
  
    // Mesa sem show nunca guarda id_show
    $: if (mesa.tipo === 'sem_show') mesa.id_show = null;
  
    function errorOf(field: string): string | null {
      return fieldErrors.find((item) => item.field === field)?.message ?? null;
    }
  
    // Carrega shows (para o select) e a mesa, se for edição
    onMount(async () => {
      loading = true;
      try {
        const resShows = await api.get('/shows');
        const bodyShows = resShows.data as ApiResponse<Show[]>;
        if (bodyShows.success) shows = bodyShows.data ?? [];
  
        if (id !== null) {
          const res = await api.get(`/mesa/${id}`);
          const body = res.data as ApiResponse<Mesa>;
          if (body.success && body.data) {
            mesa = {
              identificacao: body.data.identificacao,
              tipo: body.data.tipo,
              id_show: body.data.id_show
            };
          } else {
            error = body.message;
          }
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<Mesa> | undefined;
        error = body?.message || 'Erro ao carregar dados.';
      } finally {
        loading = false;
      }
    });
  
    async function handleSubmit() {
      fieldErrors = [];
      error = '';
      loading = true;
      try {
        const res = id === null
          ? await api.post('/mesa', mesa)
          : await api.put(`/mesa/${id}`, mesa);
        const body = res.data as ApiResponse<Mesa>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
        goto('/mesa');
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<Mesa> | undefined;
        error = body?.message || 'Erro ao salvar mesa.';
        fieldErrors = body?.errors || [];
      } finally {
        loading = false;
      }
    }
  
    function handleCancel() {
      goto('/mesa');
    }
  </script>
  
  <Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
      <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar Mesa' : 'Editar Mesa'}
      </Heading>
  
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
  
      <div>
        <Label for="identificacao">Número da mesa</Label>
        <Input
          id="identificacao"
          type="number"
          min="1"
          bind:value={mesa.identificacao}
          placeholder="Digite o número da mesa"
          required
          class="mt-1"
        />
        {#if errorOf('identificacao')}
          <div class="mt-1 text-sm text-red-500">{errorOf('identificacao')}</div>
        {/if}
      </div>
  
      <div>
        <Label for="tipo">Tipo</Label>
        <Select id="tipo" bind:value={mesa.tipo} items={tipoOptions} class="mt-1" />
        {#if errorOf('tipo')}
          <div class="mt-1 text-sm text-red-500">{errorOf('tipo')}</div>
        {/if}
      </div>
  
      {#if mesa.tipo === 'com_show'}
        <div>
          <Label for="id_show">Show</Label>
          <Select
            id="id_show"
            bind:value={mesa.id_show}
            items={showOptions}
            placeholder="Escolha um show"
            required
            class="mt-1"
          />
          {#if shows.length === 0 && !loading}
            <div class="mt-1 text-sm text-gray-500">Nenhum show cadastrado ainda.</div>
          {/if}
          {#if errorOf('id_show')}
            <div class="mt-1 text-sm text-red-500">{errorOf('id_show')}</div>
          {/if}
        </div>
      {/if}
  
      <div class="flex gap-4 justify-end mt-4">
        <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
          <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          {id === null ? 'Voltar' : 'Cancelar'}
        </Button>
        <Button type="submit" color="primary" disabled={loading}>
          <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          {id === null ? 'Cadastrar' : 'Salvar'}
        </Button>
      </div>
    </form>
  </Card>