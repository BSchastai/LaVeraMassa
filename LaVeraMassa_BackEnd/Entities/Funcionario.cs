using ProjetoIntegrador.Enums;
using System.ComponentModel.DataAnnotations;

namespace ProjetoIntegrador.Entities
{
    public class Funcionario
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string Nome { get; set; }

        [Required]
        public string Senha { get; set; }

        [Required]
        public FuncaoEnum Funcao { get; set; }
    }
}
