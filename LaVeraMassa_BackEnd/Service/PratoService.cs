using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Service
{
    public class PratoService : IPratoService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PratoService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> CreatePrato(CreatePratoInput input)
        {
            var prato = new Prato
            {
                Nome = input.Nome,
                Preco = input.Preco,
            };

            await _unitOfWork.Prato.AddAsync(prato);
            await _unitOfWork.CompleteAsync();


            if (input.IngredienteId != null && input.IngredienteId.Any())
            {
                foreach (var ingredienteId in input.IngredienteId)
                {
                    var pratoIngrediente = new PratoIngrediente
                    {
                        PratoId = prato.Id,
                        IngredienteId = ingredienteId
                    };

                    await _unitOfWork.PratoIngredientes.AddAsync(pratoIngrediente);
                }

                await _unitOfWork.CompleteAsync();
            }

            return true;
        }
    }
}
