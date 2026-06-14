<script lang="ts">
	import '../app.css';
	import Menu from '../components/Menu.svelte';
	let { children } = $props();
</script>

<main class="flex flex-col items- justify-center bg-[#ffffff]"> <!-- [url(./images/fundoprt.jpg)] bg-cover -->
  <Menu />
  <div class="w-full">
    {@render children()}
  </div>
</main>
