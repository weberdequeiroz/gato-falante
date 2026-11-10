# Miguel, o Gato Falante 🐱

Jogo infantil para o navegador: toque no Miguel, fale alguma coisa e ele repete com uma voz engraçada.

- Vozes: Fininha, Tia Dani, Bob Esponja, Pirata, Gatinho, Monstro e Robô
- Botão **🙏 Oração**: orações infantis de acordo com o horário (manhã, refeições, noite) e outras para qualquer hora
- Botão **👕 Vestir**: guarda-roupa do Miguel (chapéus, óculos, blusas com estampas, calças, shorts, saias, sapatos, capa, asas...) em 12 cores, salvo no aparelho
- Botão **🎮 Jogos**, separado em seções:
  - **Aventuras**: Corrida do Miguel (corrida infinita com 13 lugares, 3 vidas, poderes um de cada vez — Super Miguel, Penélope, escudo, turbo, ímã, balão, chuva de peixes e tartaruga — e bônus por fase sem se machucar) e Mundo do Miguel (percurso 3D com fases infinitas que salvam sozinhas, 3 vidas e a cachorrinha Penélope)
  - **Ranking**: no fim da Corrida e ao sair do Mundo aparece o ranking de todos os jogadores (pódio, top 10 da semana e de todos os tempos, quanto falta para passar o próximo)
  - **Aprender**: cores, números, letras, animais e alimentos (Conhecer e Jogar, com estrelas e troféus)
  - **Inglês e espanhol**: 9 temas cada (cumprimentos, cores, números, animais, comidas, família, corpo, roupas, casa e natureza)
  - **Criar**: música (9 instrumentos e bateria, 20 músicas para aprender, músicas surpresa sem fim, gravar a própria música, jogo de repetir melodias) e colorir (10 desenhos + desenho livre)
  - **Sons e bichos**: biblioteca com 37 sons reais (bichos, natureza, casa e cidade, pessoas) e o jogo "Que som é esse?"
  - **Brincar**: ligar os pontinhos, jogo da memória, bolhas de sabão, sombras, encontre o diferente e quebra-cabeça
  - **Faz de conta**: Mercadinho do Miguel (fazer compras com lista e moedas, ser o caixa e dar troco, arrumar as prateleiras)
  - **Jogo surpresa**: o Miguel sorteia um jogo
- **Cofrinho e loja**: os jogos dão moedas para comprar roupas especiais do Miguel
- **Ajustes** (para os pais): desligar as falas, escolher a voz do aparelho, modo calmo, vibrar, lembretes, código e apelido do aparelho e indicar para um amigo (WhatsApp, código QR)
- Lembretes de beber água (a cada 1 hora) e de se mexer (a cada 30 minutos), com exercícios guiados
- Abertura animada ao entrar
- Enquanto escuta, uma orelhona com ondas aparece e bolinhas coloridas voam até a orelha do Miguel, com um sinal sonoro no começo e no fim (dá para entender sem saber ler)
- Botão **💡 Dicas**: 59 dicas sobre respeito, alimentação saudável, higiene, segurança, natureza, sentimentos e mais
- **Modo calmo** 🌙: menos movimento e fala mais devagar, pensado também para crianças com TDAH e autismo
- Pode ser instalado no celular como app
- Na primeira visita o Miguel se apresenta e explica como brincar (botão **?** repete)
- Funciona no celular; o microfone precisa de um endereço https

**Jogar:** https://weberdequeiroz.github.io/gato-falante/

Desenvolvido por Vini & Weber.

## Painel admin e coletor

- **Painel:** `admin.html` (https://weberdequeiroz.github.io/gato-falante/admin.html). Entra com um token do GitHub (fine-grained, só o repositório `gato-falante`, permissão *Contents: Read and write*), guardado só no navegador.
- **`controle.json`**: aparelhos bloqueados, recados e o endereço do coletor. O painel grava esse arquivo pelo GitHub; o jogo lê ao abrir.
- **Coletor:** `ferramentas/coletor.php`, hospedado na Hostinger em `public_html/miguel-coletor/` (wdqbrasil.com.br). Recebe os registros dos aparelhos (uso, jogos, erros, quem está online) e guarda o ranking num SQLite (`miguel.sqlite`, protegido pelo `.htaccess` que o coletor cria). No repositório a `CHAVE` fica como `TROQUE-ESTA-CHAVE`: a chave de verdade existe só no arquivo da Hostinger e no navegador do painel.
- `jogos/controle.js` cuida do código do aparelho, dos registros, do bloqueio e dos recados; `jogos/ranking.js` mostra o ranking.

## Publicar uma versão nova

1. `./atualizar-versao.sh` (com `SILENCIOSA=1` antes, a atualização entra sem o aviso de novidades).
2. Aumentar o número do `CACHE` em `sw.js` (`miguel-vNN`).
3. Commit e push na `main` (GitHub Pages publica sozinho).
4. Se o `ferramentas/coletor.php` mudou, enviar de novo para a Hostinger, trocando a `CHAVE`.

## Voz do Miguel

As falas ficam gravadas na pasta `falas/` (uma voz neural natural, deixada com jeito de criança). O índice `falas/indice.json` liga cada frase ao seu arquivo. Frases que mudam a cada jogada e não têm gravação usam a voz do aparelho. As vozes usadas têm licença livre: Piper pt_BR (CC0) e Kokoro (Apache 2.0).

## Créditos

O mundo 3D usa a biblioteca three.js (licença MIT, cópia em `vendor/`).

A risada antes da voz do Bob Esponja (`sons/risada-bob.mp3`) foi enviada pela família, para uso só no jogo da família.

### Sons

Os sons da pasta `sons/` são gravações reais em domínio público (CC0) do site Freesound, reunidas no banco de sons ESC-50 (https://github.com/karolpiczak/ESC-50). A lista com o autor de cada som está em `sons/creditos.json` e dentro do jogo, em Biblioteca de sons › "De onde vêm esses sons?".
