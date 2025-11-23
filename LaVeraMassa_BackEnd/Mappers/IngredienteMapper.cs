using AutoMapper;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Entities;

namespace ProjetoIntegrador.Mappers
{
    public class IngredienteMapper : Profile
    {
        public IngredienteMapper()
        {
            CreateMap<UpdateIngredientes, Ingrediente>();
        }
    }
}
