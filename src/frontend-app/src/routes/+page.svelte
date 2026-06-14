<script lang="ts">
  import { heading, Heading } from 'flowbite-svelte';
  import {  P } from "flowbite-svelte";
  import Menu from '../components/Menu.svelte';
</script>

<main class="flex flex-col items- justify-center min-h-screen w-full bg-[url('./images/cylastprin.png')] bg-cover rounded-lg border-5 border-[#000000] mb-20">

</main>
<Menu />
<div class="text-center">
  <heading class = "text-[#000000] font-text4 text-5xl w-1/2" > Seja bem-vindo ao ...!</heading>

  <br><br><br>
  <p>Aqui nós disponibilizamos algumas coisas e mais um pouco.</p>
  <p>Confira logo abaixo:</p>
</div>
  
<br><br>
<div class="flex justify-center gap-4">
  <div class="">
    <a href="#fd">
      <button class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded "> Sobre </button>
    </a>
  </div>

  <div class="">
    <a href="#sd">
      <button class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded "> Reservas </button>
    </a>
  </div>
  
  <div class="">
    <a href="#td">
      <button class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded "> Mesas </button>
    </a>
  </div>

</div>

<br><br>
<div id="fd" class="text-center">
	<heading class = "text-[#000000] font-text4 text-5xl text-center" > SOBRE O BAR:</heading>

<br><br><br>
  <div class="text-[#000000] font-text3">
    <h2>Bem vindo ao bar ...!</h2>
    <h2>Aposto que você nao irá se arrepender de ter feito essa visita.</h2>
    <h2>Agora falando um pouco sobre o bar ..., nós fundados o bar no dia 29 de outubro de 2015, </h2>
    <h2>pelos amigos Dylan d'Leo, Cássio augusto e Gustavo tomas(ou tomás, tanto faz).</h2>
    <h2>Inicialmente era pra ser apenas um trabalho de escola pra um TCC(Trabalho de Conclusão do Curso),</h2>
    <h2>mas acabaram levando a ideia a diante. Hoje em dia eles estão aqui com 11 anos de empresa</h2>
    <h2>e sem previsão pra fechamento!</h2>

  </div>
</div>

<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<div class="group relative w-130 h-150 overflow-hidden border-4 border-[#000000] rounded-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <img src="./images/foto1.jpeg"
    class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0">
      
    <img src="./images/foto2.jpeg"
    class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100">
</div>

<br><br><br><br><br><br>
<div id="sd" class="text-center">
	<heading class = "text-[#000000] font-text4 text-5xl text-center" > COMO FUNCIONA AS RESERVAS?</heading>


  <div class="text-[#000000] font-text3">

    <br><br><br>
    <h2>A reserva funciona de forma muito simples,</h2>
    <h2>com, pelo menos, 24 horas de antecedencia, vc ira entrar em </h2>
    <h2>contato com o bar. a parrtir daí você terá q escolher entre</h2>
    <h2>os 3 tipos de mesa:</h2>
      <il>Mesa A: ela é mais perto do palco;</il>
      <il>Mesa B: intermediaria, não é tão longe do palco e é bem perto da cozinha;</il>
      <il>Mesa C: mais custo beneficio em coparação com as outras.</il>

  </div>
</div>

<br><br>
<div id="td" class="text-center">
	<heading class = "text-[#000000] font-text4 text-5xl text-center" > OQUE TEM DE DIFERENTE EM CADA TIPO DE MESA?</heading>

  <br><br><br>
  <div class="text-[#000000] font-text3">
    <h2>No nosso bar é possivel encontras 3 tipos de mesas:</h2>
    <h2>a A, B e C. </h2>
    <h2>Assim, nosso bar apresenta uma variedade maior de opções de escolha.</h2>
    <div class="flex items-center justify-center h-screen">
      <img class="w-200 h-150 rounded-3xl border-2 border-[#000000]]" src="./images/mapeamento.png">
    </div>

  </div>
</div>
