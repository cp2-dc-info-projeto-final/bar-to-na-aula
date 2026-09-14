<script lang="ts">
	import Menu from "../../components/Menu.svelte";
</script>

<Menu />
<div class="h-screen flex flex-col items-center justify-center p-4 bg-[url(./images/fundobaratie.png)] bg-cover">
        <div class="flex items-stretch justify-between m-130">
            <button class="w-40 h-15 bg-[#224b5d] rounded-xl hover:bg-[#385f71] hover:text-white transition"><a href="/users"> User </a></button>
            <button class="w-40 h-15 bg-[#224b5d] rounded-xl hover:bg-[#385f71] hover:text-white transition"><a href="/bebida"> Bebidas </a></button>
            <button class="w-40 h-15 bg-[#224b5d] rounded-xl hover:bg-[#385f71] hover:text-white transition"><a href="/comida"> Comida </a></button>
        </div>
</div>