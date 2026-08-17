<script lang="ts">
    import { Button } from 'flowbite-svelte'; // UI
	import Menu from "../../components/Menu.svelte";
</script>

<Menu />
<div class="flex items-stretch justify-center">
    <Button class=""><a href="/users"> User </a></Button>
    <Button class=""><a href="/bebida"> Bebidas </a></Button>
    <Button class=""><a href="/comida"> Comida </a></Button>
</div>