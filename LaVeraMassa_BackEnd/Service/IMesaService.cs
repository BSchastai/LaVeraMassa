using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;

namespace ProjetoIntegrador.Service
{
    public interface IMesaService
    {
        // Adicione esta linha:
        Task<Mesa> CreateMesa(MesaInput input);
    }
}