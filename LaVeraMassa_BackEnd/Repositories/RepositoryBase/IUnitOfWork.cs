using ProjetoIntegrador.Entities;

namespace ProjetoIntegrador.Repositories.RepositoryBase
{
    public interface IUnitOfWork : IDisposable
    {
        // Para cada entidade que você tem um repositório, adicione uma propriedade aqui.
        // Isso permite que seus serviços acessem os repositórios através da Unit of Work.

        // IContaRepository Contas { get; } // Exemplo, se você criar um repositório para Contas
        // ITransacaoRepository Transacoes { get; } // E assim por diante...
        IMesaRepository Mesas { get; }
        IIngredienteRepository Ingredientes { get; }
        IPratoIngredienteRepository PratoIngredientes { get; }
        IPratoRepository Prato { get; }
        IFuncionarioRepository Funcionario { get; }
        IReservaRepository Reserva { get; }
        IPedidoRepository Pedidos { get; }
        IRepository<Venda> Vendas { get; }
        IRepository<PedidoDelivery> Delivery { get; }
        /// <summary>
        /// Salva todas as mudanças feitas nesta unidade de trabalho para o banco de dados.
        /// </summary>
        /// <returns>O número de registros afetados no banco de dados.</returns>
        Task<int> CompleteAsync();
    }
}
