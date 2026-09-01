<script lang="ts">
    // Tabela de produtos
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge } from 'flowbite-svelte'; // UI
    import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
    import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
    import { goto } from '$app/navigation'; // navegação
    import api from '$lib/api'; // API backend
    import type { ApiResponse } from '$lib/api';
    import { onMount } from 'svelte'; // ciclo de vida
    import type { Com } from '$lib/models/Com';

    let comidas: Com[] = []
    let loading = true;
    let error = '';
    let deletingId: number | null = null; // id em deleção
    let confirmOpen = false; // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal
    let filtro = '';

    // Abre modal de confirmação
    function openConfirm(id: number) {
    confirmTargetId = id;
    confirmOpen = true;
    }
    // Fecha modal
    function closeConfirm() {
    confirmOpen = false;
    confirmTargetId = null;
    }
    
    // Confirma remoção
    function handleConfirm() {
    if (confirmTargetId !== null) {
        handleDelete(confirmTargetId);
    }
    closeConfirm();
    }

    // Cancela remoção
    function handleCancel() {
    closeConfirm();
    }

    async function handleDelete(id: number) {
    deletingId = id;
    error = '';
    try {
        const res = await api.delete(`/comida/${id}`);
        const body = res.data as ApiResponse<null>;
        if (!body.success) {
            error = body.message;
        return;
        }
        comidas = comidas.filter(comida => comida.id !== id);
    } catch (e: any) {
        console.error('Erro ao deletar alimento:', e);
        const body = e.response?.data as ApiResponse<null> | undefined;
        error = body?.message || 'Erro ao remover alimento.';
    } finally {
        deletingId = null;
    }
    }

    onMount(async () => {
    
    try {
        const res = await api.get('/com');
        const body = res.data as ApiResponse<Com[]>;
        if (body.success) {
            comidas = body.data ?? [];
        } else {
            error = body.message;
        }
    } catch (e: any) {
        console.error('Erro ao carregar alimentos:', e);

        const body = e.response?.data as ApiResponse<Com[]> | undefined;

        error = body?.message || 'Erro ao carregar alimentos';
    } finally {
        loading = false;
    }
});

    async function carregarComidas() {
    try {
        console.log("filtro: ", filtro);
        const res = await api.get(`/com?nome=${encodeURIComponent(filtro)}`);
        const body = res.data as ApiResponse<Com[]>;
        if (body.success) {
            comidas = body.data ?? [];
        } else {
        error = body.message;
        }
    } catch (e: any) {
        console.error('Erro ao carregar produtos:', e);
        const body = e.response?.data as ApiResponse<Com[]> | undefined;
        error = body?.message || 'Erro ao carregar produtos';
    } finally {
        loading = false;
    }
    }
    
</script>

{#if loading}
    <div class="my-8 text-center text-gray-500">Carregando alimentos...</div>
{:else if error}
    <div class="my-8 text-center text-red-500">{error}</div>
{:else}
    <!-- Tabela para telas médias/grandes -->
    <div class="hidden xl:block">
    <div class="filtro">
        <input type="text" id="pesquisa" placeholder="Digite o nome do aliemento..." bind:value={filtro}  on:input={carregarComidas} />

    </div>
    <!-- Tabela de usuários -->
    <Table class="w-full max-w-5xl mx-auto my-8 shadow-lg border border-gray-200 rounded-full">
        <TableHead>
        <TableHeadCell class="w-16 ">ID</TableHeadCell>
        <TableHeadCell class="w-32">Nome</TableHeadCell>
        <TableHeadCell class="min-w-0">Preço</TableHeadCell>
        <TableHeadCell class="w-20">Sabor</TableHeadCell>

        <TableHeadCell class="w-24"></TableHeadCell> <!-- coluna para editar/remover -->
        </TableHead>
        <TableBody>
        {#each comidas as salgado}

            <TableBodyRow>
            <TableBodyCell>{salgado.id}</TableBodyCell>
            <TableBodyCell>{salgado.nome}</TableBodyCell>
            <TableBodyCell>{salgado.preco}</TableBodyCell>
            <TableBodyCell>
                <Badge color={salgado.sabor === 'salgado' ? 'red' : 'blue'} class="text-xs">
                {salgado.sabor}
                </Badge>
            </TableBodyCell>

            <TableBodyCell>
                <!-- Botão editar -->
                <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/comida/edit/${salgado.id}`)}
                >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
                </button>
                <!-- Botão remover -->
                <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(salgado.id)}
                disabled={deletingId === salgado.id || loading}
                >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
                </button>
            </TableBodyCell>
            </TableBodyRow>
        {/each}
        </TableBody>
    </Table>
    </div>
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
    <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
        {#each comidas as salgado}
        <!-- Card de usuário -->
            <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-gray-200">
            <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
                <div class="text-lg font-semibold text-gray-800 text-left">{salgado.nome}</div>
                <div class="text-xs text-gray-400 text-left">ID: {salgado.id}</div>
                <Badge color={salgado.sabor === 'alcolico' ? 'red' : 'blue'} class="text-xs mt-1">
                {salgado.sabor}
                </Badge>
            </div>
            <div class="flex gap-2">
                <!-- Botão editar -->
                <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/comida/edit/${salgado.id}`)}
                >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
                </button>
                <!-- Botão remover -->
                <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(salgado.id)}
                disabled={deletingId === salgado.id || loading}
                >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
                </button>
            </div>
            </div>
            <div class="px-4 pb-4 pt-2 flex flex-col gap-2 text-left">
            <div class="flex items-center gap-2 text-left">
                <!-- Ícone de email -->
                <svg class="w-4 h-4 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12A4 4 0 1 0 8 12a4 4 0 0 0 8 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7m-7-7v7m14-7v7"/></svg>
                <span class="text-gray-700 text-sm">{salgado.preco}</span>
            </div>
            </div>
        </Card>
        {/each}
    </div>
    </div>
{/if}

<!-- Modal de confirmação -->
<ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja remover este alimento?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={handleCancel}
/>
