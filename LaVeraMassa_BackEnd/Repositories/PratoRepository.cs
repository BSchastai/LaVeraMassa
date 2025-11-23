using ProjetoIntegrador.Database;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories
{
    public class PratoRepository : Repository<Prato>, IPratoRepository
    {
        private readonly ProjetoIntegradorDbContext _dbcontext;

        public PratoRepository(ProjetoIntegradorDbContext dbContext) : base(dbContext)
        {
            _dbcontext = dbContext;
        }
    }
}
