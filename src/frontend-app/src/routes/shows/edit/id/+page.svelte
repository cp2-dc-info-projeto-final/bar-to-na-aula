<script lang="ts">
    import { page } from '$app/stores';
    import ShowForm from '../../../../components/ShowForm.svelte';
  </script>
  
  <ShowForm id={Number($page.params.id)} />