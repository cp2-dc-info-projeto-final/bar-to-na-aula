<script lang="ts">
	import Menu from "../../components/Menu.svelte";
</script>

<Menu />
<div class="bg-(url[./images/fundobaratie.png]) bg-cover">
    <div>
        <h1 class="text-color-[#ffffff]">Opções de cadastros:</h1>
    </div>

    <div class="flex items-stretch justify-between m-130">
        <button class="w-40 h-15 bg-[#ffffff] rounded-xl hover:bg-[#000000] hover:text-white transition"><a href="/users"> User </a></button>
        <button class="w-40 h-15 bg-[#ffffff] rounded-xl hover:bg-[#000000] hover:text-white transition"><a href="/bebida"> Bebidas </a></button>
        <button class="w-40 h-15 bg-[#ffffff] rounded-xl hover:bg-[#000000] hover:text-white transition"><a href="/comida"> Comida </a></button>
    </div>
</div>