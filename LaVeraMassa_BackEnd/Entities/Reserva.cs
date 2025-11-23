using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace ProjetoIntegrador.Entities
{
    public class Reserva
    {
        public long Id { get; set; }
        public int Pessoa { get; set; }
        public DateTime Date { get; set; }
        public string Telefone { get; set; }
        public string Email { get; set; }
        public string Nome { get; set; }
    }
}
