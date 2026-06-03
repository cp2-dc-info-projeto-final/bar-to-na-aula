<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import Menu from '../components/Menu.svelte';
  import {  P} from "flowbite-svelte";
</script>

<main class="flex flex-col items- justify-center min-h-screen w-full bg-[url('./images/fundolg.jpg')] bg-cover rounded-lg border-5 border-[#000000]">

	<Heading tag="h1" class= "text-center font-extrabold tracking-tight text-[#000000]">BAR TÔ NA AULA</Heading>


</main>
<Menu />
<br><br>

<div class="box-decoration-clone bg-linear-to-r from-[#341600] to-[#603f0e] px-2 text-white">
	<Heading tag="h1" class="text-center font-extrabold tracking-tight text-[#000000]">TÁ LIBERADO A AVENTURA!!!</Heading>
	<p class="text-center font-extrabold tracking-tight text-[#000000]">OLHE TUDO QUE NÓS DISPONIBILIZAMOS PARA NOSSOS CLIENTES.</p>
</div>

<br><br>
<div class="flex ">
	<div class="grid grid-cols-8 grid-rows-1 gap-4">
		<img class="border-1 rounded-3xl flex-1" src="./images/bar.jpg" alt="">
		<h2 class="box-decoration-clone bg-linear-to-r from-[#341600] to-[#603f0e] px-2 text-white border-2 text-center">COMIDAS</h2>
		<div class="contents">
			<img class="border-1 rounded-3xl flex-1" src="./images/bar.jpg" alt="">
			<h2 class="box-decoration-clone bg-linear-to-r from-[#341600] to-[#603f0e] px-2 text-white border-2 text-center">BEBIDAS</h2>
			<img class="border-1 rounded-3xl flex-1" src="./images/bar.jpg" alt="">
			<h2 class="box-decoration-clone bg-linear-to-r from-[#341600] to-[#603f0e] px-2 text-white border-2 text-center">SHOWS</h2>
		</div>
		<img class="border-1 rounded-3xl flex-1" src="./images/bar.jpg" alt="">
		<h2 class="box-decoration-clone bg-linear-to-r from-[#341600] to-[#603f0e] px-2 text-white border-2 text-center">OUTROS...</h2>
	</div>

	<!--<div class="bg-[#786452] rounded-lg w-3/6">
		<div class="text-center p-8 pt-32">
			<Heading tag="h2" class="text-4xl font-extrabold tracking-tight text-gray-900">Home</Heading>
			<P class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify  font-text1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, 
				sapien et dictum cursus, urna erat laoreet enim, nec gravida urna erat at sapien. Etiam nec dolor vitae odio hendrerit venenatis. Proin nec turpis nec sem tempus dictum. Vivamus tincidunt, 
				nisi nec facilisis cursus, enim erat dictum neque, at dignissim enim urna at velit. Integer non turpis id mi tristique cursus. Nullam in sem vitae massa dictum dictum.
			</P>

		</div>
	</div>-->
</div>