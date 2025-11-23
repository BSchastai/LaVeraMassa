using System.Linq.Expressions;

namespace ProjetoIntegrador.Repositories.RepositoryBase
{
    public interface IRepositoryBase<T> where T : class
    {
        // Métodos de Leitura
        Task<List<T>> GetAllAsync();
        Task<T> GetByIdAsync(long id);

        // Métodos de Escrita
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
    }
}