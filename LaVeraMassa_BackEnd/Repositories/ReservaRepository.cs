using ProjetoIntegrador.Database;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories
{
    public class ReservaRepository : Repository<Reserva>, IReservaRepository
    {
        private readonly ProjetoIntegradorDbContext _dbcontext;

        public ReservaRepository(ProjetoIntegradorDbContext dbContext) : base(dbContext)
        {
            _dbcontext = dbContext;
        }
    }
}
