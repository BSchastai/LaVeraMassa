using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories {
    public interface IFuncionarioRepository : IRepository<Funcionario> {
        Task<bool> FindAsync(string nome, string senha);
    }
}
