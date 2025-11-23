using Microsoft.AspNetCore.Mvc;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoIntegrador.Controllers
{
    [ApiController]
    [Route("api/web/[controller]")]
    public class PedidoController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PedidoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("lista-cozinha")]
        public async Task<IActionResult> GetPedidosCozinha()
        {
            try
            {
                // 1. Busca TUDO separado (Mais seguro que confiar no Include agora)
                var pedidos = await _unitOfWork.Pedidos.GetAllAsync();
                var pratos = await _unitOfWork.Prato.GetAllAsync();
                var mesas = await _unitOfWork.Mesas.GetAllAsync();
                var delivery = await _unitOfWork.Delivery.GetAllAsync();

                // 2. Converte para listas em memória
                var listaPedidos = pedidos.ToList();
                var listaPratos = pratos.ToList();
                var listaMesas = mesas.ToList();
                var listaDelivery = delivery.ToList();

                // 3. Cruza os dados manualmente (JOIN na memória)
                var listaVisual = listaPedidos
                    .Where(p => p.Status < 3) // Só os ativos
                    .Select(p => {
                        // Encontra o prato na lista carregada
                        var prato = listaPratos.FirstOrDefault(x => x.Id == p.PratoId);
                        // Encontra a mesa na lista carregada
                        var mesa = listaMesas.FirstOrDefault(x => x.Id == p.MesaId);

                        return new
                        {
                            p.Id,
                            p.Status,
                            p.Quantidade,
                            // Garante que descrição nunca seja nula
                            Descricao = string.IsNullOrEmpty(p.Descricao) ? "Sem descrição" : p.Descricao,
                            Observacao = p.Observacao ?? "",
                            p.MesaId,

                            // Se achou a mesa, põe o número. Se não, põe 0.
                            MesaNumero = mesa != null ? mesa.Numero : 0,

                            // Se achou o prato, põe o nome. Se não, usa "Item Manual"
                            NomePrato = prato != null ? prato.Nome : "Item Manual / Excluído"
                        };
                    })
                    .OrderBy(p => p.Status)
                    .ThenBy(p => p.Id)
                    .ToList();

                var visualDelivery = delivery.
                    Where(d => d.Status < 3)
                    .Select(d =>
                    {
                        return new
                        {
                            d.Id,
                            d.Status,
                            MesaNumero = "Delivery",
                            Pratos = d.ItensResumo
                        };
                    });

                return Ok(new
                {
                    listaVisual,
                    visualDelivery
                });
            }
            catch (Exception ex)
            {
                // Se ainda der erro, mostra o detalhe
                return BadRequest(new { erro = ex.Message, onde = ex.StackTrace });
            }
        }

        [HttpPut("avancar-status")]
        public async Task<IActionResult> AvancarStatus([FromQuery] long id)
        {
            try
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
                if (pedido == null) return NotFound("Pedido não encontrado.");

                if (pedido.Status < 2)
                {
                    pedido.Status++;
                    _unitOfWork.Pedidos.Update(pedido);
                }
                else if (pedido.Status == 2)
                {
                    pedido.Status = 3; // Finalizado
                    _unitOfWork.Pedidos.Update(pedido);
                }

                await _unitOfWork.CompleteAsync();
                return Ok(new { mensagem = "Status atualizado", status = pedido.Status });
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao salvar: {ex.Message}");
            }
        }
    }
}