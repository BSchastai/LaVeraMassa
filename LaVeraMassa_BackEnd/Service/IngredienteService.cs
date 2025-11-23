using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Repositories.RepositoryBase;

namespace ProjetoIntegrador.Service
{
    public class IngredienteService : IIngredienteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public IngredienteService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<bool> CreateIngrediente(CreateIngredienteInput input)
        {
            try
            {
                var ingrediente = new Ingrediente
                {
                    Nome = input.Nome,
                    Quantidade = input.Quantidade,
                    Preco = input.Preco
                };

                await _unitOfWork.Ingredientes.AddAsync(ingrediente);
                await _unitOfWork.CompleteAsync();

                return true;
            }
            catch (DbUpdateException dbEx)
            {
                return false;
            }
        }

        public async Task<Ingrediente> UpdateIngrediente(UpdateIngredientes update)
        {
            var ingrediente = await _unitOfWork.Ingredientes.GetByIdAsync(update.Id);
            _mapper.Map(update, ingrediente);

            await _unitOfWork.CompleteAsync();

            return ingrediente;
 
        }
    }
}
