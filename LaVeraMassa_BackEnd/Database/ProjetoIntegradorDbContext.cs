using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Entities;

namespace ProjetoIntegrador.Database
{
    public class ProjetoIntegradorDbContext : DbContext
    {
        public ProjetoIntegradorDbContext(DbContextOptions<ProjetoIntegradorDbContext> options) : base(options) { }
        public DbSet<Ingrediente> Ingredientes { get; set; }
        public DbSet<Funcionario> Funcionarios { get; set; }
        public DbSet<Mesa> Mesas { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<Prato> Pratos { get; set; }
        public DbSet<PratoIngrediente> PratoIngredientes { get; set; }
        public DbSet<Reserva> Reservas { get; set; }
        public DbSet<Venda> Vendas { get; set; }
        public DbSet<PedidoDelivery> PedidosDelivery { get; set; }

    }
}
