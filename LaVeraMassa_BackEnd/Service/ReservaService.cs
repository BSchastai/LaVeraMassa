using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Service
{
    // AQUI ESTAVA O ERRO: Faltava herdar da interface
    public class ReservaService : IReservaService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReservaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ... resto do código igual ...
        public async Task<Reserva> CreateReserva(CreateReceitaInput input)
        {
            // ... seu código ...
            var reserva = new Reserva
            {
                // Atenção aqui: DateOnly + TimeOnly requer tratamento especial dependendo da versão do .NET
                // Se input.Data for DateOnly e input.Horario for TimeOnly:
                Date = input.Data.ToDateTime(input.Horario),

                Pessoa = input.Pessoa,
                Telefone = input.Telefone,
                Email = input.Email,
                Nome = input.Nome,
            };

            await _unitOfWork.Reserva.AddAsync(reserva);
            await _unitOfWork.CompleteAsync();

            return reserva;
        }
    }
}