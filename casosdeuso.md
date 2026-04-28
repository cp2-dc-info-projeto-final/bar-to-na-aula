# Casos de Uso:

## Caso de uso 1: Cadastro do cliente.

## Ator: 
- cliente

### Fluxo principal:
- O cliente seleciona a opção “Criar conta”.

- O sistema leva o cliente até a tela de registro contendo um formulário.

- O cliente preenche os campos do formulário (informando e-mail e criando uma senha).

- O sistema consulta o banco de dados para verificar a disponibilidade das informações fornecidas.

- O banco de dados retorna uma confirmação positiva.

- O sistema realiza o cadastro, salvando os dados do novo cliente.

- O sistema encaminha o cliente para a página principal do site.




## Caso de Uso 2: Login do cliente.

## Ator:
- cliente

### Fluxo principal:
- O cliente seleciona a opção "Login".

- O sistema leva o cliente até a tela de preenchimento de senha e email.

- cliente preenche os campos da tela.

- O sistema consulta o banco de dados para a confirmação dos dados inseridos.

- O banco de dados retorna uma confirmação positiva.

- O sistema encaminha o cliente para a página principal do site.




## Caso de Uso 3: Excluir conta.

## Ator:
- cliente 

### Fluxo principal:
- O cliente acessa o menu do seu perfil com as configurações da sua conta.

- O cliente aperta o botão excluir conta.

- O sistema solicita a senha do cliente para proseguir com a exclusão.

- O cliente digita a senha.

- O sistema analisa a veracidade da senha no banco de dados.

- O banco de dados retorna uma confirmação positiva.

- O sistema pergunta se quer confirmar a exclusão.

- O cliente aperta o botão confirmar.

- O sistema apaga os dados do cliente no banco de dados.

- O sistema apresenta mensagem de sucesso.

- O sistema realoca o cliente para a página de login e cadastro.




## Caso de Uso 4: Editar dados de cadastro.

## Ator:
- cliente

### Fluxo principal:
- O cliente acessa o menu do seu perfil com as configurações da sua conta.

- O cliente aperta o botão "editar dados de cadastro da conta".

- O sistema exibe os dados de cadastro do cliente.

- O cliente edita dados do seu cadastro e aperta o botão confirmar.

- O sistema edita os dados do cliente no banco de dados.

- O sistema mando o cliente pra tela principal.




## Caso de Uso 5: Busca de produtos.

## Atores:
- cliente

### Fluxo principal:
- O sistema apresenta a página inicial do site.

- O cliente aperta na barra de pesquisa.

- O cliente digita o nome do Produto que deseja.

- O cliente aperta no botão "Enter".

- O sistema consulta o banco de dados.

- O banco retorna a Produto desejada.

- A busca é finalizada.




## Caso de Uso 6: Reserva de mesa.

## Atores:
- cliente

### Fluxo principal:
- O cliente clica na opção "reserva mesa".

- O cliente seleciona a mesa desejada.

- O sistema verifica se a mesa ja foi reservada.

- O sistema retorna com uma confirmaçãopositiva.

- Reserva concluida.




## Caso de Uso 7: ver cardápio.
## Atores:
- Cliente

### Fluxo principal:
 O cliente clica no botão "cardápio".

- O sistema vai colocar o cardápio na tela.

- Cliente vê o cardápio.




## Caso de Uso 8: Fazer pedido.

## Atores:
- cliente

### Fluxo principal:
- O cliente clica no ícone do "fazer pedido".

- O cliente seleciona os produtos desejados.

- O sistema anota os produtos selecionados.

- O sitema manda pros funcionarios.

- O sistema retorna com a confirmação positiva.

- O pedido foi concluido.




## Caso de Uso 9: Logout

## Atores:
- cliente

### Fluxo principal:
- O usuário acessa o menu do seu perfil com as configurações da sua conta e aperta o botão de "Logout".

- O sistema apresenta uma mensagem perguntando "Quer confirmar o Logout?".

- O usuário confirma.

- O sistema apaga o login do usuário.

- O sistema realoca o usuário para o menu do seu perfil com as configurações da sua conta.




## Caso de Uso 10: Gerenciar pedido

## Atores:
- funcioario

### Fluxo principal:
- O funcionario recebe uma mensagem do pedido feito pelo cliente.

- Funcionario começa a preparar o peido.




## Caso de Uso 11: Gerenciar funcionario.

## Atores:
- Administrador

### Fluxo principal:
- O administrador acessa o sistema.

- Seleciona a opção "funcionarios".

- Visualiza a lista de funcionarios.

- Clica em "Adicionar funcionario".

- Preenche as informações do funcionario(nome, foto, serviço, gmail e senha).

- Clica em "Salvar funcinario".

- O sistema adiciona o novo funcionario ao sistema.




## Caso de Uso 12: Gerenciar clientes.

## Atores:
- Administrador

### Fluxo principal:
- O administrador acessa o sistema.

- O administrador vai até a seção "clientes".

- O administrador visualiza a lista de clientes cadastrados.

- O administrador clica sobre um cliente para ver detalhes.

- O administrador pode optar por editar ou excluir o cadastro do cliente.
