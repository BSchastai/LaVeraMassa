using ProjetoIntegrador.Entities;
// Importa o namespace onde está o IRepositoryBase
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories
{
    public interface IPedidoRepository : IRepositoryBase<Pedido>
    {
    }
}