<script lang="ts">
  import Menu from '../components/Menu.svelte';
  import '../app.css';
  import { goto } from '$app/navigation';

  function irCardapio() {
    goto('/cardapio');
  }

  function irCadastro() {
    goto('/cadastro');
  }
</script>

<div class=" ">
  <div class="fundo">
    <img
      src="/images/baratieretro.png"
      alt="Bar Baratié"
      class="w-full h-48 sm:h-72 xl:h-full object-cover object-center m-auto shadow-2xl"
    />
  </div>

  <div class="sobre bg-white px-4 py-8 sm:px-8 xl:py-0">
    <div class="max-w-3xl mx-auto text-center">
      <h1 class="mt-4 xl:mt-25 text-2xl sm:text-3xl xl:text-4xl font-text2">
        Seu próximo brinde começa aqui! 🍻
      </h1>

      <h2 class="mt-6 xl:mt-10 text-base sm:text-lg xl:text-xl font-text1">
        Boa música, drinks incríveis e momentos que merecem ser lembrados.
      </h2>

      <h2 class="mt-6 xl:mt-10 text-base sm:text-lg xl:text-xl font-text1">
        Mais do que um bar, um lugar para reunir os amigos,<br class="hidden xl:block" />
        celebrar a vida e aproveitar cada momento. Com bebidas especiais,<br class="hidden xl:block" />
        petiscos deliciosos e uma atmosfera única, temos tudo para transformar qualquer<br class="hidden xl:block" />
        encontro em uma experiência inesquecível.
      </h2>

      <h2 class="mt-6 xl:mt-10 text-base sm:text-lg xl:text-xl font-text1">
        Chegue, escolha seu drink e aproveite. A noite é sua!
      </h2>

      <div class="mt-8 xl:mt-10 flex flex-col items-center gap-4">
        <button
          type="button"
          on:click={irCardapio}
          class="bg-[#166a8e] text-white rounded-2xl text-base sm:text-xl h-12 xl:h-10 w-full max-w-xs xl:w-100 xl:hover:w-150 transition-all duration-300 hover:bg-[#deb266] hover:text-black"
        >
          CONFERIR O CARDÁPIO
        </button>

        <button
          type="button"
          on:click={irCadastro}
          class="bg-[#166a8e] text-white rounded-2xl text-base sm:text-xl h-12 xl:h-10 w-full max-w-xs xl:w-100 xl:hover:w-150 transition-all duration-300 hover:bg-[#deb266] hover:text-black"
        >
          CADASTRE-SE NO SITE
        </button>
      </div>
    </div>

    <div class="mt-10 overflow-hidden transition-transform duration-700 ease-in-out hover:scale-105">
      <img
        src="/images/taven.png"
        alt="Taverna"
        class="block mx-auto border-2 rounded-3xl w-full max-w-sm xl:max-w-none xl:w-130"
      />
    </div>
    
  </div>
  
</div>
<div class="fundo bg-[#deb266]"></div>