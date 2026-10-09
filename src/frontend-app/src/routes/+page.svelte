<script lang="ts">
  import Menu from '../components/Menu.svelte';
  import '../app.css';
	import { goto } from '$app/navigation';
	import { button } from 'flowbite-svelte';

function irCardapio(){
  goto('/cardapio');
}

function irCadastro(){
  goto('/cadastro');
}
</script>


<div class="bg-[#deb266]"> 
  <div class="fundo">
    <img src="./images/baratieretro.png" alt="" class="h-full w-screen m-auto shadow-2xl">
  </div>
  <div class="sobre bg-[#ffffff]"><br>
      <div class="">
        <div class="col-span-1 text-center">
          <div class="">
            <h1 class="mt-25 text-4xl font-text2">Seu próximo brinde começa aqui! 🍻</h1>
            <h2 class="mt-10 text-xl font-text1">Boa música, drinks incríveis e momentos que merecem ser lembrados.</h2>
            <h2 class="mt-10 text-xl font-text1">Mais do que um bar, um lugar para reunir os amigos,<br> celebrar
               a vida e aproveitar cada momento.Com bebidas especiais,<br> petiscos deliciosos e uma atmosfera 
               única, temos tudo para transformar qualquer <br> encontro em uma experiência inesquecível.</h2>
            <h2 class="mt-10 font-text1">Chegue, escolha seu drink e aproveite. A noite é sua!</h2>
            <h2 class="mt-10">
              <button on:click={irCardapio} class="bg-[#166a8e] h-10 w-100 text-xl rounded-2xl text-[#ffffff] border-6 border-[#deb266] hover:bg-[#deb266] hover:text-[#000000] hover:border-[#166a8e]">CONFERIR O CARDÁPIO</button>
              <button on:click={irCadastro} class="bg-[#166a8e] h-10 w-100 text-xl rounded-2xl text-[#ffffff] border-6 border-[#deb266] hover:bg-[#deb266] hover:text-[#000000] hover:border-[#166a8e]">CADASTRE-SE NO SITE</button>

              
          </div>
        </div>
        <div class="col-span-1  overflow-hidden transition-transform duration-700 ease-in-out hover:scale-105">
            <img src="./images/taven.png" alt="" class="mt-20 display-block ml-auto mr-auto border-2 rounded-4xl w-130   ">
        </div>
      </div>
    </div>

  <div class=" h-screen"></div>
</div>