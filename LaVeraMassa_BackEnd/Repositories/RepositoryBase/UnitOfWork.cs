using ProjetoIntegrador.Database;
using ProjetoIntegrador.Entities;
using System.Threading.Tasks; // Adicionei para garantir que o Task funcione

namespace ProjetoIntegrador.Repositories.RepositoryBase
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ProjetoIntegradorDbContext _context;

        // --- PROPRIEDADES DOS REPOSITÓRIOS ---
        public IMesaRepository Mesas { get; private set; }
        public IIngredienteRepository Ingredientes { get; private set; }
        public IPratoIngredienteRepository PratoIngredientes { get; private set; }
        public IPratoRepository Prato { get; private set; }
        public IFuncionarioRepository Funcionario { get; private set; }
        public IReservaRepository Reserva { get; private set; }
        public IPedidoRepository Pedidos { get; private set; }
        public IRepository<PedidoDelivery> Delivery { get; private set; }

        // A CORREÇÃO ESTÁ AQUI EMBAIXO:
        // Adicionamos a propriedade Vendas para cumprir o contrato da Interface
        public IRepository<Venda> Vendas { get; private set; }
        // ----------------------------------

        public UnitOfWork(ProjetoIntegradorDbContext context)
        {
            _context = context;

            // Inicializa os repositórios específicos
            Mesas = new MesaRepository(_context);
            Ingredientes = new IngredienteRepository(_context);
            PratoIngredientes = new PratoIngredienteRepository(_context);
            Prato = new PratoRepository(_context);
            Funcionario = new FuncionarioRepository(_context);
            Reserva = new ReservaRepository(_context);
            Pedidos = new PedidoRepository(_context);
            Delivery = new Repository<PedidoDelivery>(_context);

            // A CORREÇÃO DA INICIALIZAÇÃO:
            // Inicializa o repositório de Vendas usando o Genérico (Repository<T>)
            // Isso evita que você tenha que criar um arquivo "VendaRepository.cs" só pra isso.
            Vendas = new Repository<Venda>(_context);
            // -----------------------------
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}