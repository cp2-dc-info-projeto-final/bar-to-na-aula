<script>
	import { goto } from "$app/navigation";
	import { limparCarrinho } from "$lib/cart";


function voltar(){
    limparCarrinho();
    goto ("/");

    
    
}
</script>



<div class="bg-[url(.../images/clecio.png)] bg-cover ">
    <div class="text-center mt-100">
        <h1 class="text-4">COMPRA BEM-SUCEDIDA!!!</h1>
        <p>Volte sempre. Sua presença é muito especial para nós do <b>Baratiê</b>!</p>
    </div><br>
    <div>
        <button 
        onclick={voltar}
        class="bg-[#ffffff] border-2 text-[#000000] rounded-xl w-30 ml-225 hover:bg-[#000000] hover:text-[#ffffff]"
        >Voltar</button>
    </div>

</div>