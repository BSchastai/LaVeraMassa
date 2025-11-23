using ProjetoIntegrador.Database;
using ProjetoIntegrador.Entities;

// Truque para resolver confusão de nomes:
using Base = ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories
{
    // Herda de Base.RepositoryBase<Pedido>
    public class PedidoRepository : Base.RepositoryBase<Pedido>, IPedidoRepository
    {
        // Agora o construtor vai funcionar porque o pai tem um construtor igual
        public PedidoRepository(ProjetoIntegradorDbContext context) : base(context)
        {
        }
    }
}