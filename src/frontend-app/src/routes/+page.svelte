<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import Menu from '../components/Menu.svelte';
  import {  P} from "flowbite-svelte";
</script>

<main class="flex flex-col items- justify-center min-h-screen w-full bg-[url('./images/fundolg.jpg')] bg-cover w-screen">



</main>
<Menu />

<br><div class="flex w-screen">
	<div class="bg-[#786452]  rounded-lg w-2/5">
		<div class="text-center p-8 pt-32">
			<Heading tag="h2" class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 font-text2">Home</Heading>
			<P class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify  font-text1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, 
				sapien et dictum cursus, urna erat laoreet enim, nec gravida urna erat at sapien. Etiam nec dolor vitae odio hendrerit venenatis. Proin nec turpis nec sem tempus dictum. Vivamus tincidunt, 
				nisi nec facilisis cursus, enim erat dictum neque, at dignissim enim urna at velit. Integer non turpis id mi tristique cursus. Nullam in sem vitae massa dictum dictum.
			</P>
		</div>
	</div>

	<div class="w-1/5">
	</div>

	<div class="bg-[url('./images/bar.jpg')] bg-cover rounded-lg w-2/5">
		<div class="text-center p-8 pt-32">
			<Heading tag="h2" class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 font-text2">Home</Heading>
			<P class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify  font-text1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, 
				sapien et dictum cursus, urna erat laoreet enim, nec gravida urna erat at sapien. Etiam nec dolor vitae odio hendrerit venenatis. Proin nec turpis nec sem tempus dictum. Vivamus tincidunt, 
				nisi nec facilisis cursus, enim erat dictum neque, at dignissim enim urna at velit. Integer non turpis id mi tristique cursus. Nullam in sem vitae massa dictum dictum.
			</P>

		</div>
	</div>
</div>