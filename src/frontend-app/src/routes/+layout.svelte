<script lang="ts">
	import '../app.css';
	import Menu from '../components/Menu.svelte';
	let { children } = $props();
</script> 
  <Menu />
  <div class="w-full">
    {@render children()}
  </div>

