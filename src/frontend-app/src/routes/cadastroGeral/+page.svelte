<script lang="ts">
	import Menu from "../../components/Menu.svelte";
</script>

<Menu />
<body class="bg-[url(./images/fundobaratie.png)] bg-cover">

        <!-- <div>
            <h1 class="text-center">Opçoes de cadastro:</h1>
        </div> -->
        <div class="flex items-stretch justify-between m-130">
            <button class="w-40 h-15 bg-[#224b5d] rounded-xl hover:bg-[#385f71] hover:text-white transition"><a href="/users"> User </a></button>
            <button class="w-40 h-15 bg-[#224b5d] rounded-xl hover:bg-[#385f71] hover:text-white transition"><a href="/bebida"> Bebidas </a></button>
            <button class="w-40 h-15 bg-[#224b5d] rounded-xl hover:bg-[#385f71] hover:text-white transition"><a href="/comida"> Comida </a></button>
        </div>
</body>