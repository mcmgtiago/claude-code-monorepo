# clone interaction probe

- URL: http://127.0.0.1:8123/
- Actions: 23
- Console errors: 144
- Network events: 24

## Actions
| # | Type | Target | Changed | URL after | Screenshot |
|---:|---|---|---:|---|---|
| 1 | scroll | middle | yes | http://127.0.0.1:8123/ | screenshots\01-scroll-middle-b04a45f075.png |
| 2 | scroll | bottom | yes | http://127.0.0.1:8123/ | screenshots\02-scroll-bottom-7297e0cbea.png |
| 3 | hover | LUMINAL | no | http://127.0.0.1:8123/ | screenshots\03-hover-LUMINAL-cf80f0f703.png |
| 4 | hover | PROJETOS | no | http://127.0.0.1:8123/ | screenshots\04-hover-PROJETOS-04efa6543c.png |
| 5 | hover | SERVIÇOS | no | http://127.0.0.1:8123/ | screenshots\05-hover-SERVI-OS-444279fc08.png |
| 6 | hover | SOBRE | no | http://127.0.0.1:8123/ | screenshots\06-hover-SOBRE-6e9fa423a7.png |
| 7 | hover | PLANOS | no | http://127.0.0.1:8123/ | screenshots\07-hover-PLANOS-ddefc5e3c6.png |
| 8 | hover | CONTATO | no | http://127.0.0.1:8123/ | screenshots\08-hover-CONTATO-7968cfdbdf.png |
| 9 | hover | INICIAR PROJETO | no | http://127.0.0.1:8123/ | screenshots\09-hover-INICIAR-PROJETO-80b29de280.png |
| 10 | hover | VER PROJETOS | no | http://127.0.0.1:8123/ | screenshots\10-hover-VER-PROJETOS-fd6e6417f5.png |
| 11 | click | LUMINAL | yes | http://127.0.0.1:8123/#home | screenshots\11-click-LUMINAL-e202508b5b.png |
| 12 | click | PROJETOS | yes | http://127.0.0.1:8123/#work | screenshots\12-click-PROJETOS-f198326d11.png |
| 13 | click | SERVIÇOS | yes | http://127.0.0.1:8123/#services | screenshots\13-click-SERVI-OS-30a4224e70.png |
| 14 | click | SOBRE | yes | http://127.0.0.1:8123/#about | screenshots\14-click-SOBRE-9a0d06fe09.png |
| 15 | click | PLANOS | yes | http://127.0.0.1:8123/#pricing | screenshots\15-click-PLANOS-647138d632.png |
| 16 | click | CONTATO | yes | http://127.0.0.1:8123/#contact | screenshots\16-click-CONTATO-12f47504ea.png |
| 17 | click | INICIAR PROJETO | yes | http://127.0.0.1:8123/#contact | screenshots\17-click-INICIAR-PROJETO-e70f32caee.png |
| 18 | click | VER PROJETOS | yes | http://127.0.0.1:8123/#work | screenshots\18-click-VER-PROJETOS-d9ca959e62.png |
| 19 | click | INICIAR PROJETO | yes | http://127.0.0.1:8123/#contact | screenshots\19-click-INICIAR-PROJETO-88374da985.png |
| 20 | click | VER PLANOS | yes | http://127.0.0.1:8123/#pricing | screenshots\20-click-VER-PLANOS-0ade4988b7.png |
| 21 | click | ARCHIVE-03 // ENTERPRISE ESCALA PARA AGÊNCIAS Para estruturas maiores que precisam de infraestrutura sob medida e suport | yes | http://127.0.0.1:8123/#contact | screenshots\21-click-ARCHIVE-03-ENTERPRISE-ESCALA-PARA-AG-NCIAS-Para-estruturas-maiores-que-precisam-de-i-da16b475a6.png |
| 22 | click | FALE CONOSCO | no | http://127.0.0.1:8123/ |  |
| 23 | canvas-drag | html > body:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > canvas:nth-of-type(1) | no | http://127.0.0.1:8123/ | screenshots\23-canvas-drag-html-body-nth-of-type-1-div-nth-of-type-1-div-nth-of-type-1-div-nth-of-type-1--6a44a08a19.png |

## Findings
- 22 visible interactive candidates discovered
- 1 visible canvas targets discovered
- 13/23 actions changed DOM, URL, scroll, or visible overlay counts
- Canvas drag evidence exists; inspect screenshots before simplifying WebGL/Canvas behavior.
