using Microsoft.AspNetCore.Mvc;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities; // Importante para usar a classe Pedido
using ProjetoIntegrador.Repositories.RepositoryBase;
using ProjetoIntegrador.Service;

namespace ProjetoIntegrador.Controllers
{
    [ApiController]
    [Route("api/web/[controller]")]
    public class MesaController : ControllerBase
    {
        private readonly IMesaService _mesaService;
        private readonly IUnitOfWork _unitOfWork;

        public MesaController(IMesaService mesaService, IUnitOfWork unitOfWork)
        {
            _mesaService = mesaService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost]
        [Route("cria-mesa")]
        public async Task<IActionResult> CreateMesa(MesaInput input)
        {
            var mesa = await _mesaService.CreateMesa(input);
            return Ok(mesa);
        }

        [HttpGet]
        [Route("lista")]
        public async Task<IActionResult> GetAllMesas()
        {
            // Ordena pelo número da mesa para ficar bonito no grid (1, 2, 3...)
            var lista = await _unitOfWork.Mesas.GetAllAsync();
            return Ok(lista.OrderBy(m => m.Numero));
        }

        // ==========================================================
        // LÓGICA REAL DE PEDIDOS (COZINHA + CONTA)
        // ==========================================================
        [HttpPost]
        [Route("adicionar-pedido")]
        public async Task<IActionResult> AdicionarPedido(PedidoMesaInput input)
        {
            // 1. Busca a Mesa
            var mesa = await _unitOfWork.Mesas.GetByIdAsync(input.MesaId);
            if (mesa == null) return NotFound("Mesa não encontrada.");

            // 2. Busca o Prato
            var prato = await _unitOfWork.Prato.GetByIdAsync(input.PratoId);
            if (prato == null) return NotFound("Prato não encontrado.");

            // 3. Calcula valor
            decimal valorTotalItem = prato.Preco * input.Quantidade;

            // 4. Atualiza a Mesa
            mesa.CustoTotal += valorTotalItem;
            mesa.Status = 1;
            _unitOfWork.Mesas.Update(mesa);

            // 5. Cria o Pedido
            var novoPedido = new Pedido
            {
                MesaId = mesa.Id,
                Status = 0,
                PratoId = input.PratoId,
                Quantidade = input.Quantidade,

                // --- A LINHA QUE FALTAVA ---
                Observacao = input.Observacao ?? "", // Se vier nulo, salva vazio
                // ---------------------------

                Descricao = $"{input.Quantidade}x {prato.Nome} | Obs: {input.Observacao}"
            };

            await _unitOfWork.Pedidos.AddAsync(novoPedido);
            await _unitOfWork.CompleteAsync();

            return Ok(new
            {
                mensagem = "Pedido enviado para a cozinha!",
                novoTotalMesa = mesa.CustoTotal
            });
        }

        // ==========================================================
        // FECHAR CONTA (LIMPEZA)
        // ==========================================================
        [HttpPut]
        [Route("fechar-mesa")]
        public async Task<IActionResult> FecharMesa([FromQuery] long id)
        {
            var mesa = await _unitOfWork.Mesas.GetByIdAsync(id);
            if (mesa == null) return NotFound("Mesa não encontrada.");

            // 1. ANTES DE ZERAR, SALVA A VENDA
            if (mesa.CustoTotal > 0)
            {
                var novaVenda = new Venda
                {
                    ValorTotal = mesa.CustoTotal,
                    DataVenda = DateTime.Now, // Pega a hora atual do servidor (Brasília/Local)
                    FormaPagamento = "Padrão"
                };

                // Se seu UnitOfWork não tiver Vendas, precisaremos adicionar.
                // Vou assumir que você pode usar: _context.Vendas.Add(novaVenda) se tiver o context injetado
                // OU, se tiver adicionado no UnitOfWork:
                await _unitOfWork.Vendas.AddAsync(novaVenda);
            }

            // 2. Agora sim, zera a mesa
            mesa.Status = 0; // Livre
            mesa.CustoTotal = 0;

            _unitOfWork.Mesas.Update(mesa);
            await _unitOfWork.CompleteAsync();

            return Ok("Conta fechada e venda registrada no faturamento!");
        }
    }
}