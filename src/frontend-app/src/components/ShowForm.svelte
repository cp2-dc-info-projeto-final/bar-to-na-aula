<script lang="ts">
    // Formulário de usuário
    import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import { goto } from '$app/navigation'; // navegação
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
    import type { Show, ShowFormData } from '$lib/models/Show';

    export let id: number | null = null; // id do usuário

    let show: ShowFormData = { id: 0, artista: '', horario: '',  genero: '' }; // dados do form
    

    let loading = false;
    let error = '';
    let fieldErrors: ApiFieldError[] = [];

    function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
    }


    // Submissão do formulário
    async function handleSubmit() {
    fieldErrors = [];


    loading = true;
    error = '';
    try {
        const ShowData = { ...show };
           // Remove senha vazia na edição para não sobrescrever indevidamente
        if (id !== null && !ShowData.artista) {
         ShowData.id;
        }
        if (id === null) {
        const res = await api.post('/show', ShowData);
        const body = res.data as ApiResponse<Show>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        } else {
        const res = await api.put(`/show/${id}`, ShowData);
        const body = res.data as ApiResponse<Show>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        }
        goto('/show'); 
    } catch (e: any) {
        const body = e.response?.data as ApiResponse<Show> | undefined;
        error = body?.message || 'Erro ao salvar usuário.';
        fieldErrors = body?.errors || [];
    } finally {
        loading = false;
    }
    }

    function handleCancel() {
    goto('/show');
    }
</script>

<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg ">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar show' : 'Editar apresentação'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
        <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo login -->
    <div>
        <Label for="artista">Artista</Label>
        <Input id="artista" bind:value={show.artista} placeholder="Digite o nome do artista" required class="mt-1" />
        {#if errorOf('artista')}
        <div class="mt-1 text-sm text-red-500">{errorOf('artista')}</div>
        {/if}
    </div>

    <div>
        <Label for="horario">Horario</Label>
        <Input id="horario" type="text" bind:value={show.horario} placeholder="Digite o horario do show" required class="mt-1" />
        {#if errorOf('horario')}
        <div class="mt-1 text-sm text-red-500">{errorOf('horario')}</div>
        {/if}
    </div>

    <div>
        <Label for="genero">Genero</Label>
        <Input id="genero" type="genero" bind:value={show.genero} placeholder="Digite o genero da apresentação" required class="mt-1" />
        {#if errorOf('genero')}
        <div class="mt-1 text-sm text-red-500">{errorOf('genero')}</div>
        {/if}
    </div>
    <!-- Botões de ação -->
    <div class="flex gap-4 justify-end mt-4">
        <!-- Botão cancelar/voltar -->
        <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
        <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
        {id === null ? 'Voltar' : 'Cancelar'}
        </Button>
        <!-- Botão salvar -->
        <Button type="submit" color="primary" disabled={loading}>
        <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
        {id === null ? 'Cadastrar' : 'Salvar'}
        </Button>
    </div>
</Card>
