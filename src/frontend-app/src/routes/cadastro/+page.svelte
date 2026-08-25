<script lang="ts">
  import Menu from '../../components/Menu.svelte';
  import { Card, Button, Input, Label, Alert } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { cadastro as authCadastro } from "$lib/auth";
  

    let tipoListas = ['alcolicos', 'Não Alcolicos']
    let saborSelecionada = '';
    let saborListas = ['salgado', 'doce']
    let tipoSelecionada = '';

    let email = '';
    let login = '';
    let senha = '';
    let confirmsenha = '';
    let loading = false;
    let error = '';
  
    async function handleCadastro() {
      if (!email || !login || !senha || !confirmsenha) {
        error = 'Por favor, preencha todos os campos';
        return;
      }
  
      if (senha !== confirmsenha) {
        error = 'As senhas não coincidem';
        return;
      }
  
      loading = true;
      error = '';

      try {
        const result = await authCadastro({ email, login, senha });
        if (result.success) {
          await goto('/login');
        } else {
          error = result.message || 'Erro ao realizar cadastro';
        }
      } catch (err) {
        error = 'Erro interno do servidor';
        console.error('Erro no cadastro:', err);
      } finally {
        loading = false;
      }
    }


    
  </script>
  
  <Menu />
  
  <div class="">
    <div class="h-screen flex flex-col items-center justify-center p-4 bg-[url(./images/fundoLogin.png)] bg-cover">
      <div class="w-full max-w-sm">
  
        <Card class="p-6 w-full bg-[]">
          <form on:submit|preventDefault={handleCadastro} class="space-y-6">
  
              <div>
                <Label for="nome" class=" text-[#ffffff] text-center">Login</Label>
                <Input
                  class="input-style"
                  id="nome"
                  type="text"
                  bind:value={login}
                  placeholder="Digite seu login"
                  required
                />
              </div>
  
              <div>
                <Label for="login" class="mb-2 text-[#ffffff] text-center">Email</Label>
                <Input
                  class="input-style"
                  id="login"
                  type="text"
                  bind:value={email}
                  placeholder="Digite seu email"
                  required
                />
              </div>
  
              <div>
                <Label for="senha" class="mb-2 text-[#ffffff] text-center">Senha</Label>
                <Input
                  class="input-style"
                  id="senha"
                  type="password"
                  bind:value={senha}
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              <div>
                <Label for="confirmsenha" class="mb-2 text-[#ffffff] text-center">Confirmar Senha</Label>
                <Input
                  class="input-style"
                  id="confirmsenha"
                  type="password"
                  bind:value={confirmsenha}
                  placeholder="Confirme sua senha"
                  required
                />
              </div>
  
              {#if error}
                <Alert class="mb-4">
                  {error}
                </Alert>
              {/if}
  
              <Button
                type="submit"
                class="w-full bg-[#000000]"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
  
          </form>
        </Card>
      </div>
    </div>
  </div> 