<script lang="ts">
  import { Card, Button, Label, Input, Heading } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import api from '$lib/api';
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { goto } from '$app/navigation';
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons';
  import type { Show, ShowFormData } from '$lib/models/Show';

  export let id: number | null = null; // null = cadastro, número = edição

  let show: ShowFormData = { artista: '', horario: '', genero: '' };

  let loading = false;
  let error = '';
  let fieldErrors: ApiFieldError[] = [];

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  // Carrega show se for edição
  onMount(async () => {
    if (id === null) return;
    loading = true;
    try {
      const res = await api.get(`/shows/${id}`);
      const body = res.data as ApiResponse<Show>;
      if (body.success && body.data) {
        show = {
          artista: body.data.artista,
          horario: body.data.horario?.slice(0, 5) ?? '', // "21:00:00" -> "21:00"
          genero: body.data.genero
        };
      } else {
        error = body.message;
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Show> | undefined;
      error = body?.message || 'Erro ao carregar show.';
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
        ? await api.post('/shows', show)
        : await api.put(`/shows/${id}`, show);
      const body = res.data as ApiResponse<Show>;
      if (!body.success) {
        error = body.message;
        fieldErrors = body.errors;
        return;
      }
      goto('/shows');
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Show> | undefined;
      error = body?.message || 'Erro ao salvar show.';
      fieldErrors = body?.errors || [];
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/shows');
  }
</script>

<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
  <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <Heading tag="h3" class="mb-2 text-center">
      {id === null ? 'Cadastrar Show' : 'Editar Show'}
    </Heading>

    {#if error}
      <div class="text-red-500 text-center">{error}</div>
    {/if}

    <div>
      <Label for="artista">Artista</Label>
      <Input id="artista" bind:value={show.artista} placeholder="Digite o nome do artista" required class="mt-1" />
      {#if errorOf('artista')}
        <div class="mt-1 text-sm text-red-500">{errorOf('artista')}</div>
      {/if}
    </div>

    <div>
      <Label for="horario">Horário</Label>
      <Input id="horario" type="time" bind:value={show.horario} required class="mt-1" />
      {#if errorOf('horario')}
        <div class="mt-1 text-sm text-red-500">{errorOf('horario')}</div>
      {/if}
    </div>

    <div>
      <Label for="genero">Gênero</Label>
      <Input id="genero" bind:value={show.genero} placeholder="Digite o gênero da apresentação" required class="mt-1" />
      {#if errorOf('genero')}
        <div class="mt-1 text-sm text-red-500">{errorOf('genero')}</div>
      {/if}
    </div>

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