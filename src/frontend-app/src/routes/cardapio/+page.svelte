<script lang="ts">
    import ComTablecard from '../../components/ComTablecard.svelte';
	import BebTablecard from '../../components/BebTablecard.svelte';

</script>

<div class=" bg-[url(./images/vinil.png)] bg-cover h-screen ">
    <br><br><br><br><br><br>
    <div class="grid grid-cols-2">
        <div class="cols-1"> 
            <ComTablecard />
        </div>
        <div class="cols-1">
            <BebTablecard />
        </div>
    </div>
</div>
