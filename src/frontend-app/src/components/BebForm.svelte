<script lang="ts">
    // Formulário de usuário
    import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import { goto } from '$app/navigation'; // navegação
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
    import type { Beb, BebFormData } from '$lib/models/Beb';

    export let id: number | null = null; // id do usuário

    let bebida: BebFormData = { id: 0, nome: '', marca: '',  preço: '', tamanho: '', tipo: 'alcolico' }; // dados do form
    
    // Opções de roles
    const roleOptions = [
    { value: 'alcolico', name: 'alcolico' },
    { value: 'naoAlcolico', name: 'Não alcolico' }
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
        const BebData = { ...bebida };
           // Remove senha vazia na edição para não sobrescrever indevidamente
        if (id !== null && !BebData.nome) {
        BebData.id;
        }
        if (id === null) {
        const res = await api.post('/beb', BebData);
        const body = res.data as ApiResponse<Beb>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        } else {
        const res = await api.put(`/beb/${id}`, BebData);
        const body = res.data as ApiResponse<Beb>;
        if (!body.success) {
            error = body.message;
            fieldErrors = body.errors;
            return;
        }
        }
        goto('/bebidas');
    } catch (e: any) {
        const body = e.response?.data as ApiResponse<Beb> | undefined;
        error = body?.message || 'Erro ao salvar usuário.';
        fieldErrors = body?.errors || [];
    } finally {
        loading = false;
    }
    }

    function handleCancel() {
    goto('bebida');
    }
</script>

<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg ">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar Produto' : 'Editar Produto'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
        <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo login -->
    <div>
        <Label for="nome">Nome</Label>
        <Input id="nome" bind:value={bebida.nome} placeholder="Digite o nome" required class="mt-1" />
        {#if errorOf('nome')}
        <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
    </div>
    <div>
        <Label for="marca">Marca</Label>
        <Input id="marca" type="marca" bind:value={bebida.marca} placeholder="Digite a marca" required class="mt-1" />
        {#if errorOf('marca')}
        <div class="mt-1 text-sm text-red-500">{errorOf('marca')}</div>
        {/if}
    </div>
    <div>
        <Label for="tamanho">Tamanho</Label>
        <Input
            id="tamanho"
            bind:value={bebida.tamanho}
            placeholder="Digite o tamanho"
            required
            class="mt-1"
        />
    
        {#if errorOf('tamanho')}
            <div class="mt-1 text-sm text-red-500">
                {errorOf('tamanho')}
            </div>
        {/if}
    </div>
    
    <div>
        <Label for="preço">Preço</Label>
        <Input id="preço" type="text" bind:value={bebida.preço} placeholder="Digite o preço" required class="mt-1" />
        {#if errorOf('preço')}
        <div class="mt-1 text-sm text-red-500">{errorOf('preço')}</div>
        {/if}
    </div>
    <div>
        <Label for="tipo">Tipo</Label>
        <Select id="tipo" bind:value={bebida.tipo} items={roleOptions} class="mt-1" />
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
