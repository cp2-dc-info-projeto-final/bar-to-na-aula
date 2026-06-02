<script lang="ts">
	import '../app.css';
	import Menu from '../components/Menu.svelte';
	let { children } = $props();
</script>

<main class="flex flex-col items- justify-center min-h-screen w-full bg-[url('./images/fundoLogin.png')] bg-cover  bg-[#000000]">
  <Menu />
  <div class="w-full">
    {@render children()}
  </div>
</main>
