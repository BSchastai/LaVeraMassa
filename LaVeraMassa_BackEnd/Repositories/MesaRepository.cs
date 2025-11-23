using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Database;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories
{
    public class MesaRepository : Repository<Mesa>, IMesaRepository
    {
        private readonly ProjetoIntegradorDbContext _dbcontext;

        public MesaRepository(ProjetoIntegradorDbContext dbContext) : base(dbContext)
        {
            _dbcontext = dbContext;
        }

        public async Task<Mesa> GetMesa(long id)
        {
            return await _dbcontext.Mesas.Where(e => e.Id == id).FirstOrDefaultAsync();
        }
    }
}
