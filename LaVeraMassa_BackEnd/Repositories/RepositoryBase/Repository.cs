using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Database;

namespace ProjetoIntegrador.Repositories.RepositoryBase
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        protected readonly ProjetoIntegradorDbContext _context;
        protected readonly DbSet<TEntity> _dbSet;

        public Repository(ProjetoIntegradorDbContext context)
        {
            _context = context;
            _dbSet = context.Set<TEntity>();
        }

        public virtual async Task<TEntity?> GetByIdAsync(long id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task AddAsync(TEntity entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public virtual void Update(TEntity entity)
        {
            _dbSet.Update(entity);
        }

        public virtual void Delete(TEntity entity)
        {
            _dbSet.Remove(entity);
        }
    }
}
