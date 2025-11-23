using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Service
{
    public class MesaService : IMesaService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MesaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Mesa> CreateMesa(MesaInput input)
        {
            var novaMesa = new Mesa
            {
                Numero = input.Numero,
                Status = 0, // Começa Livre
                CustoTotal = 0
            };

            await _unitOfWork.Mesas.AddAsync(novaMesa);
            await _unitOfWork.CompleteAsync();

            return novaMesa;
        }
    }
}