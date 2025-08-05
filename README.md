# Estudos Bíblicos - As Três Mensagens Angélicas

Este repositório contém estudos bíblicos sobre as Três Mensagens Angélicas de Apocalipse 14:6-12.

## Estrutura do Projeto

- `index.html` - Página inicial com links para todos os estudos
- `1-estudo_primeira-mensagem-angelica/` - Estudo sobre a Primeira Mensagem Angélica
- `2-estudo_quem-devemos-adorar/` - Estudo sobre a Adoração
- `3-estudo_segunda-mensagem-angelica/` - Estudo sobre a Segunda Mensagem Angélica
- `4-estudo_terceira-mensagem-angelica/` - Estudo sobre a Terceira Mensagem Angélica
- `5-estudo_como-guardar-o-sabado/` - Estudo sobre o Sábado
- `6-estudo_a-obra-de-jesus-cristo-no-santuario-celestial/` - Estudo sobre o Santuário Celestial
- `8-estudo_a-expiacao/` - Estudo sobre a Expiação
- `8-estudo_profecia-das-2300-tardes-e-manhas/` - Estudo sobre a Profecia de Daniel 8:14
- `9-estudo_estado-dos-mortos/` - Estudo sobre o Estado dos Mortos

## Como Publicar no Surge.sh

### Pré-requisitos

1. Node.js instalado (https://nodejs.org/)
2. Conta no Surge.sh (crie em https://surge.sh/)

### Passo a Passo

1. **Instale as dependências** (se for a primeira vez):
   ```bash
   npm install
   ```

2. **Execute o script de publicação**:
   ```bash
   npm run deploy
   ```

3. **Siga as instruções no terminal**:
   - Na primeira vez, você precisará fazer login com sua conta do Surge
   - O script irá publicar o site em https://estudoscasa.advertenciafinal.com

### Publicação Manual (opcional)

Se preferir publicar manualmente, instale o Surge globalmente e publique:

```bash
npm install --global surge
surge . estudoscasa.advertenciafinal.com
```

## Personalização

- Para alterar o domínio, edite a variável `DOMAIN` no arquivo `deploy.js`
- Para modificar o design, edite o arquivo `index.html`
- Para atualizar os estudos, edite os respectivos arquivos HTML em cada pasta

## Licença

Este projeto está licenciado sob a licença MIT.
