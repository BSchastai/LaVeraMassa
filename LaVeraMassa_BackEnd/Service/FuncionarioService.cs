using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Service {
    public class FuncionarioService : IFuncionarioService {
        private readonly IUnitOfWork _unitOfWork;
        public FuncionarioService(IUnitOfWork unitOfWork) { 
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> CreatFuncionario(FuncionarioInput input) {
            try {
                var funcionario = new Funcionario {
                    Nome = input.Nome,
                    Senha = input.Senha,
                    Funcao = input.Funcao

                };

                await _unitOfWork.Funcionario.AddAsync(funcionario);
                await _unitOfWork.CompleteAsync();

                return true;
            } catch (DbUpdateException dbEx) {
                return false;
            }
        }
    }
}
