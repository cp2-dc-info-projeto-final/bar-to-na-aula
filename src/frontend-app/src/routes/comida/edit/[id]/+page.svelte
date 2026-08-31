<script lang="ts">
    // Importa o componente de formulário de usuário
    import ComForm from '../../../../components/ComForm.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';

    // Captura o parâmetro 'id' da URL
    const { id } = get(page).params;
</script>
<!-- Utiliza o componente UserForm passando id -->
<ComForm id={Number(id)} />