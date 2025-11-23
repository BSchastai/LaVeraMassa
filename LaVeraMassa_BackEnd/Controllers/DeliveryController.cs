using Microsoft.AspNetCore.Mvc;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;
using System;
using System.Threading.Tasks;

namespace ProjetoIntegrador.Controllers
{
    // DTO para receber os dados do Javascript limpos
    public class DeliveryInput
    {
        public string NomeCliente { get; set; }
        public string Telefone { get; set; }
        public string Endereco { get; set; }
        public string FormaPagamento { get; set; }
        public decimal ValorTotal { get; set; }
        public string[] Itens { get; set; } // Lista de nomes dos pratos
    }

    [ApiController]
    [Route("api/web/[controller]")]
    public class DeliveryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeliveryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpPost("criar")]
        public async Task<IActionResult> CriarPedido([FromBody] DeliveryInput input)
        {
            // Transforma a lista de array ["Pizza", "Refri"] em uma string "Pizza, Refri"
            string resumo = string.Join(", ", input.Itens);

            var novoPedido = new PedidoDelivery
            {
                NomeCliente = input.NomeCliente,
                Telefone = input.Telefone,
                Endereco = input.Endereco,
                FormaPagamento = input.FormaPagamento,
                ValorTotal = input.ValorTotal,
                ItensResumo = resumo,
                DataPedido = DateTime.Now,
                Status = 0 // 0 = Novo Pedido
            };

            await _unitOfWork.Delivery.AddAsync(novoPedido);
            await _unitOfWork.CompleteAsync();

            return Ok(new { mensagem = "Pedido recebido com sucesso!", id = novoPedido.Id });
        }

        // Para o painel administrativo ver os pedidos (Futuro)
        [HttpGet("lista-todos")]
        public async Task<IActionResult> GetTodos()
        {
            return Ok(await _unitOfWork.Delivery.GetAllAsync());
        }
    }
}