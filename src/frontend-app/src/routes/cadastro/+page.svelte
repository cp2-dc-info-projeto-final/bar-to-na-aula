<script lang="ts">
  import Menu from '../../components/Menu.svelte';
  import { Card, Button, Input, Label, Alert } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { cadastro as authCadastro } from "$lib/auth";
  
    let nome = '';
    let login = '';
    let password = '';
    let confirmPassword = '';
    let loading = false;
    let error = '';
  
    async function handleCadastro() {
      if (!nome || !login || !password || !confirmPassword) {
        error = 'Por favor, preencha todos os campos';
        return;
      }
  
      if (password !== confirmPassword) {
        error = 'As senhas não coincidem';
        return;
      }
  
      loading = true;
      error = '';
  
      try {
        const result = await authCadastro({ nome, login, password });
  
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
  
        <Card class="p-6 w-full bg-[#000000]">
          <form on:submit|preventDefault={handleCadastro} class="space-y-6">
  
              <div>
                <Label for="nome" class="mb-2 text-[#ffffff] text-center">Nome</Label>
                <Input
                  class="input-style"
                  id="nome"
                  type="text"
                  bind:value={nome}
                  placeholder="Digite seu Nome"
                  required
                />
              </div>
  
              <div>
                <Label for="login" class="mb-2 text-[#ffffff] text-center">Login</Label>
                <Input
                  class="input-style"
                  id="login"
                  type="text"
                  bind:value={login}
                  placeholder="Digite seu login"
                  required
                />
              </div>
  
              <div>
                <Label for="password" class="mb-2 text-[#ffffff] text-center">Senha</Label>
                <Input
                  class="input-style"
                  id="password"
                  type="password"
                  bind:value={password}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
  
              <div>
                <Label for="confirmPassword" class="mb-2 text-[#ffffff] text-center">Confirmar Senha</Label>
                <Input
                  class="input-style"
                  id="confirmPassword"
                  type="password"
                  bind:value={confirmPassword}
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