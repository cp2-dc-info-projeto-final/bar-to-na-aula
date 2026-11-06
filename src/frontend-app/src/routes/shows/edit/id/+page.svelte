<script lang="ts">
  import { page } from '$app/stores'; // parâmetros da rota
  import ShowForm from '../../../../components/ShowForm.svelte';

  $: id = Number($page.params.id);
  $: valid = Number.isInteger(id) && id > 0; // evita GET /shows/NaN
</script>

{#if valid}
  <ShowForm {id} />
{:else}
  <div class="my-8 text-center text-red-500">ID de show inválido.</div>
{/if}