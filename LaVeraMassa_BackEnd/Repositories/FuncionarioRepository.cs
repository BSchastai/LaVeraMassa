using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Database;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Repositories {
    public class FuncionarioRepository : Repository<Funcionario>, IFuncionarioRepository {

        private readonly ProjetoIntegradorDbContext _dbcontext;

        public FuncionarioRepository(ProjetoIntegradorDbContext dbcontext) : base(dbcontext) {
            _dbcontext = dbcontext;
        }

        public async Task<bool> FindAsync(string nome, string senha) {
            var funcionario = await _dbcontext.Funcionarios
                .Where(f => f.Nome == nome)
                .FirstOrDefaultAsync();

            if (funcionario == null) {
                return false;
            }

            if (funcionario.Senha != senha) {
                return false;
            }

            return true;

        }

    }
}
