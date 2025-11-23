using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjetoIntegrador.Entities
{
    public class Ingrediente
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string Nome { get; set; }

        public int Quantidade { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Preco { get; set; }
    }
}
