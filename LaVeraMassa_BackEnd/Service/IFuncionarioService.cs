using ProjetoIntegrador.Dtos;

namespace ProjetoIntegrador.Service {
    public interface IFuncionarioService {
        Task<bool> CreatFuncionario(FuncionarioInput input);
    }
}
