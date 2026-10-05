<script lang="ts">
    // Formulário de usuário
    import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import { goto } from '$app/navigation'; // navegação
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
    import type { Mesa, MesaFormData } from '$lib/models/Mesa';

    export let id: number | null = null; // id do usuário

    let mesa: MesaFormData = { id: 0, indentificação: '', tipo: 'sem_show' }; // dados do form
    
    // Opções de roles
    const roleOptions = [
    { value: 'sem_show', name: 'sem show' },
    { value: 'com_show', name: 'sem show' }
    ];
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
        const MesaData = { ...mesa };
           // Remove senha vazia na edição para não sobrescrever indevidamente
        if (id !== null && !MesaData.indentificação) {
        MesaData.id;
        }
        if (id === null) {
        const res = await api.post('/Mesa', MesaData);
        const body = res.data as ApiResponse<Mesa>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        } else {
        const res = await api.put(`/Mesa/${id}`, MesaData);
        const body = res.data as ApiResponse<Mesa>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        }
        goto('/mesa'); 
    } catch (e: any) {
        const body = e.response?.data as ApiResponse<Mesa> | undefined;
        error = body?.message || 'Erro ao salvar usuário.';
        fieldErrors = body?.errors || [];
    } finally {
        loading = false;
    }
    }

    function handleCancel() {
    goto('/mesa');
    }
</script>

<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg ">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar mesa' : 'Editar mesa'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
        <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo login -->
    <div>
        <Label for="indentificação">indentificação</Label>
        <Input id="indentificação" bind:value={mesa.indentificação} placeholder="Digite o numero da mesa" required class="mt-1" />
        {#if errorOf('indentificação')}
        <div class="mt-1 text-sm text-red-500">{errorOf('indentificação')}</div>
        {/if}
    </div>

    <div>
        <Label for="tipo">Tipo</Label>
        <Select id="tipo" bind:value={mesa.tipo} items={roleOptions} class="mt-1" />
        {#if errorOf('tipo')}
        <div class="mt-1 text-sm text-red-500">{errorOf('tipo')}</div>
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
