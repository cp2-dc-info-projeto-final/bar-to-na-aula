<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Heading, button} from "flowbite-svelte";
  import { onMount } from "svelte";
  import { logout, getCurrentUser, getToken, type User } from "$lib/auth";
  import { goto } from "$app/navigation";
  import { ArrowRightToBracketOutline } from "flowbite-svelte-icons";
  import { page } from "$app/stores";
  import { CartPlusAltOutline, ClockSolid } from 'flowbite-svelte-icons'; // ícones
  import { carrinho, removerDoCarrinho, atualizarQuantidade, totalItems, totalPrice, limparCarrinho } from '$lib/cart';
  import { registrarCompra, trocarUsuarioHistorico  } from '$lib/historico';
  import '../app.css';
  
  let user: User | null = null;
  let hasToken = false;
  let loadingUser = false;
  let authRequestId = 0;
  let aberto = false;

  function carrin() {
  aberto = !aberto;
}     

  // Verifica token sincronamente (instantâneo)
  async function updateAuthStatus() {
    hasToken = getToken() !== null;

    if (!hasToken) {
      user = null;
      loadingUser = false;
      return;
    }

    if (user || loadingUser) {
      return;
    }

    loadingUser = true;
    const requestId = ++authRequestId;

    try {
      const userData = await getCurrentUser();
      if (requestId !== authRequestId) {
        return;
      }
      user = userData;
      hasToken = userData !== null;
    } catch {
      if (requestId !== authRequestId) {
        return;
      }
      user = null;
      hasToken = false;
    } finally {
      if (requestId === authRequestId) {
        loadingUser = false;
      }
    }
  }

  // Reativo à mudança de página
  $: if ($page.url.pathname) {
    void updateAuthStatus();
  }

  onMount(() => {
    void updateAuthStatus();
  });

  // função para logout (só apaga o token)
  async function handleLogout() {
    try {
      authRequestId += 1;
      await logout();
      user = null;
      hasToken = false;
      loadingUser = false;
      goto('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  function formatarPreco(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function cancelar() {
    aberto = false;
  }

  function comprar() {
  if ($carrinho.length === 0) return;

  registrarCompra($carrinho, user?.id ?? null);
  limparCarrinho();

  aberto = false;
  goto('/compraB'); // compra bem-sucedida
}

// Sempre que o usuário muda (login, logout, carregamento), troca o histórico
$: trocarUsuarioHistorico(user);
</script>

<div class="relative px-8 h-full">
  <Navbar class="start-0 top-0 z-20 fixed w-full py-2.5 sm:px-4">
    <NavBrand href="/">
      
    <Heading class="self-center text-4xl font-text2 whitespace-nowrap text-[#000308]"><img src="./images/logo.png" alt="" class="h-8 w-18 rounded-4xl"></Heading>  <!-- icone de casinha -->
    </NavBrand>
    <NavHamburger />
    <NavUl>
      <!-- <NavLi class="self-center text-4xl font-text2 whitespace-nowrap text-[#000308]">&#33294;</NavLi> -->
      <NavLi href="/" class="text-[#000000] underline-offset-4 font-text2 hover:underline  hover:text-[#166a8e] transition">Home</NavLi>

      {#if user} <!-- se existir usuário é porque conseguiu logar-->
        <NavLi href="/about" class="text-[#000000] underline-offset-4 font-text2 hover:underline  hover:text-[#166a8e] transition">Reservas</NavLi>
        {/if}

      {#if user} <!-- se existir usuário é porque conseguiu logar-->
        <NavLi href="/historico" class="text-[#000000] underline-offset-4 font-text2 hover:underline  hover:text-[#166a8e] transition">historico</NavLi>
        {/if}

      <NavLi href="/cardapio" class="text-[#000000] underline-offset-4 font-text2 hover:underline  hover:text-[#166a8e] transition">Cardapio</NavLi>
      <NavLi href="/shows" class="text-[#000000] underline-offset-4 font-text2 hover:underline hover:text-[#166a8e] transition">Shows</NavLi>     
      {#if hasToken}
        {#if user} <!-- se existir usuário é porque conseguiu logar-->
          {#if user.role === 'admin'} <!-- só exibe menu usuários para admin-->
            <NavLi href="/cadastroGeral" class="text-[#000000] underline-offset-4 font-text2 hover:underline hover:decoration-2 hover:text-[#166a8e] transition">Cadastros</NavLi>
          {/if}


          <NavLi>
            <div class="flex items-center">
              <span class="text-[#000000] font-text2">Olá, {user.login}</span>
              <button 
                class="ml-2 bg-[#000000] hover:bg-[#ffffff] hover:text-[#000000] text-white rounded text-sm flex items-center gap-1"
                on:click={handleLogout}
              >
                <ArrowRightToBracketOutline class="w-4 h-4" />
                Sair
              </button>
            </div>
          </NavLi>
        {:else if loadingUser}
          <NavLi class="text-lg font-bold px-4 py-2 text-[#ffffff] dark:text-primary-400">Carregando...</NavLi>
        {:else}
          <NavLi href="/login" class="text-[#000000] underline-offset-4 font-text2 hover:underline hover:decoration-2  hover:text-[#166a8e] transition">Login</NavLi>
        {/if}
      {:else}
        <!-- se não tem token, exibe botão de login-->
        <NavLi href="/login" class="text-[#000000] underline-offset-4 hover:underline font-text2 hover:decoration-2  hover:text-[#166a8e] transition">Login</NavLi>
      {/if}

       
      {#if user} <!-- se existir usuário é porque conseguiu logar-->
        <!-- botão de carrinho -->
          <button class="icon-btn relative" on:click={carrin} aria-expanded={aberto}   >
            <CartPlusAltOutline class="w-6 h-6" />
            {#if $totalItems > 0}
              <span class="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {$totalItems}
              </span>
            {/if}
          </button>
          {/if}
      
      {#if aberto}
      <div class="fixed top-16 right-4 z-30 w-80 max-h-[80vh] bg-white text-black border-2 rounded-xl shadow-xl flex flex-col p-4">
        <!-- lista de itens adicionados ao carrinho -->
        <div class="flex-1 overflow-y-auto">
          {#if $carrinho.length === 0}
              <p class="text-sm text-gray-500 text-center mt-4">Seu carrinho está vazio.</p>
            {:else}
              <ul class="divide-y">
                {#each $carrinho as item (item.id)}
                  <li class="flex items-center justify-between gap-2 py-2">
                    <div>
                      <p class="text-sm text-[#000000]">{item.nome}</p>
                      <p class="text-xs text-gray-500">{formatarPreco(item.preco)} un.</p>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        class="w-6 h-6 border rounded flex items-center justify-center"
                        on:click={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                      >
                        -
                      </button>
                      <span class="text-sm w-4 text-center">{item.quantidade}</span>
                      <button
                        class="w-6 h-6 border rounded flex items-center justify-center"
                        on:click={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                      >
                        +
                      </button>
                      <button
                        class="text-xs text-red-600 ml-2"
                        on:click={() => removerDoCarrinho(item.id)}
                      >
                        remover
                      </button>
                    </div>
                  </li>
                {/each}
              </ul>

              <div class="flex items-center justify-between border-t pt-2 mt-2">
                <span class="text-sm font-semibold text-[#000000]">Total</span>
                <span class="text-sm font-semibold text-[#000000]">{formatarPreco($totalPrice)}</span>
              </div>
            {/if}

        </div>
    
        <div class="grid grid-cols-2 gap-2 mt-4">
          <button class="bg-[#000000] border-2 h-8 rounded-4xl text-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000]" on:click={cancelar}>
            Cancelar
          </button>
          <button class="bg-[#000000] border-2 h-8 rounded-4xl text-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000] disabled:opacity-40" on:click={comprar} disabled={$carrinho.length === 0}>
            Comprar
          </button>
        </div>
      </div>

      {/if}


  <!-- prototipo de historico na barra de trabalho -->

      <!-- {#if user} 
        <button class="icon-btn relative" on:click={hist} aria-expanded={aberto}   >
          <ClockSolid class="w-6 h-6" />
          {#if $totalItems > 0}
            <span class="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {$totalItems}
            </span>
          {/if}
        </button>
        {/if}
    
    {#if aberto}

      

    {/if} -->
    </NavUl>
  </Navbar>
</div>