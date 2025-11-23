using ProjetoIntegrador.Database;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories
{
    public class PratoIngredienteRepository : Repository<PratoIngrediente>, IPratoIngredienteRepository
    {
        private readonly ProjetoIntegradorDbContext _dbcontext;

        public PratoIngredienteRepository(ProjetoIntegradorDbContext dbContext) : base(dbContext)
        {
            _dbcontext = dbContext;
        }

    }
}
