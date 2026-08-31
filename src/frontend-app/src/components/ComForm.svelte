<script lang="ts">
    // Formulário de usuário
    import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import { goto } from '$app/navigation'; // navegação
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
    import type { Com, ComFormData } from '$lib/models/Com';

    export let id: number | null = null; // id do usuário

    let comida: ComFormData = { id: 0, nome: '', preco: '', sabor: 'salgado' }; // dados do form
    
    // Opções de roles
    const roleOptions = [
    { value: 'salgado', name: 'salgado' },
    { value: 'doce', name: 'doce' }
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
        const ComData = { ...comida };
           // Remove senha vazia na edição para não sobrescrever indevidamente
        if (id !== null && !ComData.nome) {
        ComData.id;
        }
        if (id === null) {
        const res = await api.post('/com', ComData);
        const body = res.data as ApiResponse<Com>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        } else {
        const res = await api.put(`/com/${id}`, ComData);
        const body = res.data as ApiResponse<Com>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        }
        goto('/comidas'); 
    } catch (e: any) {
        const body = e.response?.data as ApiResponse<Com> | undefined;
        error = body?.message || 'Erro ao salvar usuário.';
        fieldErrors = body?.errors || [];
    } finally {
        loading = false;
    }
    }

    function handleCancel() {
    goto('/comida');
    }
</script>

<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg ">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar Alimento' : 'Editar Alimento'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
        <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo login -->
    <div>
        <Label for="nome">Nome</Label>
        <Input id="nome" bind:value={comida.nome} placeholder="Digite o nome" required class="mt-1" />
        {#if errorOf('nome')}
        <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
    </div>

    <div>
        <Label for="preco">Preço</Label>
        <Input id="preco" type="text" bind:value={comida.preco} placeholder="Digite o preço" required class="mt-1" />
        {#if errorOf('preco')}
        <div class="mt-1 text-sm text-red-500">{errorOf('preco')}</div>
        {/if}
    </div>

    <div>
        <Label for="sabor">Sabor</Label>
        <Select id="sabor" bind:value={comida.sabor} items={roleOptions} class="mt-1" />
        {#if errorOf('sabor')}
        <div class="mt-1 text-sm text-red-500">{errorOf('sabor')}</div>
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
