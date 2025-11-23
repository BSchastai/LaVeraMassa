using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Database;

namespace ProjetoIntegrador.Repositories.RepositoryBase
{
    // A classe é pública e implementa a interface que acabamos de criar
    public class RepositoryBase<T> : IRepositoryBase<T> where T : class
    {
        protected readonly ProjetoIntegradorDbContext _context;

        // O Construtor que aceita 1 argumento (O que estava faltando antes)
        public RepositoryBase(ProjetoIntegradorDbContext context)
        {
            _context = context;
        }

        public async Task<List<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<T> GetByIdAsync(long id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task AddAsync(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
        }

        public void Update(T entity)
        {
            _context.Set<T>().Update(entity);
        }

        public void Delete(T entity)
        {
            _context.Set<T>().Remove(entity);
        }
    }
}