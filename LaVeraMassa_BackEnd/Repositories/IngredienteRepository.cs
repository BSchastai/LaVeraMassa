using ProjetoIntegrador.Database;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories
{
    public class IngredienteRepository : Repository<Ingrediente>, IIngredienteRepository
    {
        private readonly ProjetoIntegradorDbContext _context;

        public IngredienteRepository(ProjetoIntegradorDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
