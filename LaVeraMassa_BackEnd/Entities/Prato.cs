using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjetoIntegrador.Entities
{
    public class Prato
    {
        [Key]
        public long Id { get; set; }
        public string Nome { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Preco { get; set; }
    }
}
