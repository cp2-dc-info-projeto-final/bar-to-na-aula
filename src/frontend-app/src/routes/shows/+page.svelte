<script lang="ts">
  // Página principal de shows
  import { Button } from 'flowbite-svelte'; // UI
  import { goto } from '$app/navigation'; // navegação
  import { PlusOutline } from 'flowbite-svelte-icons'; // ícones
  import ShowTableCard from '../../components/ShowTableCard.svelte'; // lista de shows
</script>

<!-- Fundo de vinil (imagem em static/images/vinil.png) -->
<div class="min-h-screen bg-[url('/images/vinil.png')] bg-cover bg-fixed font-text3">
  <div class="pt-24 pb-12 px-2">
    <!-- Título -->
    <h1 class="text-4xl font-bold text-center text-white drop-shadow">Shows</h1>


    <!-- Lista (pesquisa, tabela/cards) -->
    <ShowTableCard />
  </div>
</div>