using System.ComponentModel.DataAnnotations.Schema;

namespace ProjetoIntegrador.Dtos
{
    public class UpdateIngredientes
    {
        public long Id { get; set; }
        public string Nome { get; set; }
        public int Quantidade { get; set; }
        public decimal Preco { get; set; }
    }
}
