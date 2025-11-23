using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;

namespace ProjetoIntegrador.Service
{
    public interface IReservaService
    {
        Task<Reserva> CreateReserva(CreateReceitaInput input);

    }
}
