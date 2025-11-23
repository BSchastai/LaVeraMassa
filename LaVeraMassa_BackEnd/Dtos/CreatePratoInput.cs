using System.ComponentModel.DataAnnotations.Schema;

namespace ProjetoIntegrador.Dtos
{
    public class CreatePratoInput
    {
        public string Nome { get; set; }
        public decimal Preco { get; set; }
        public List<long> IngredienteId { get; set; }
    }
}
