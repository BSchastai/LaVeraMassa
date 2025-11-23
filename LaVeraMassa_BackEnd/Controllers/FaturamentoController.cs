using Microsoft.AspNetCore.Mvc;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase; // Ajuste conforme seu namespace
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoIntegrador.Controllers
{
    [ApiController]
    [Route("api/web/[controller]")]
    public class FaturamentoController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public FaturamentoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("diario")]
        public async Task<IActionResult> GetFaturamentoDiario()
        {
            // Busca todas as vendas (Idealmente filtrar no banco, mas vamos filtrar na memória por facilidade agora)
            var todasVendas = await _unitOfWork.Vendas.GetAllAsync();

            var hoje = DateTime.Today; // 00:00:00 de hoje

            // Filtra só as vendas de hoje
            var vendasHoje = todasVendas
                .Where(v => v.DataVenda.Date == hoje)
                .ToList();

            var totalHoje = vendasHoje.Sum(v => v.ValorTotal);
            var qtdVendas = vendasHoje.Count;

            return Ok(new
            {
                total = totalHoje,
                quantidade = qtdVendas,
                data = hoje.ToString("dd/MM/yyyy")
            });
        }

        [HttpGet("historico")]
        public async Task<IActionResult> GetHistorico()
        {
            var todas = await _unitOfWork.Vendas.GetAllAsync();
            // Retorna as últimas 10 vendas
            return Ok(todas.OrderByDescending(v => v.DataVenda).Take(10));
        }
    }
}