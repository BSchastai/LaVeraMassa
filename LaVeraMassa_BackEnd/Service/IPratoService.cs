using ProjetoIntegrador.Dtos;

namespace ProjetoIntegrador.Service
{
    public interface IPratoService
    {
        Task<bool> CreatePrato(CreatePratoInput input);

    }
}
