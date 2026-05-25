<script lang="ts">
	import '../app.css';
	import Menu from '../components/Menu.svelte';
	let { children } = $props();
</script>

<main class="flex flex-col items- justify-center min-h-screen w-full bg-[url('./images/fundolg.jpg')] bg-cover dark:bg-gray-900">
  <Menu />
  <div class="w-full max-w-3xl px-4 md:px-8">
    {@render children()}
  </div>
</main>
