using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;

namespace ProjetoIntegrador.Service
{
    public interface IIngredienteService
    {
        Task<bool> CreateIngrediente(CreateIngredienteInput input);
        Task<Ingrediente> UpdateIngrediente(UpdateIngredientes update);

    }
}
