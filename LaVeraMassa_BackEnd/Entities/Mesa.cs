using System.ComponentModel.DataAnnotations;

namespace ProjetoIntegrador.Entities
{
    public class Mesa
    {
        public long Id { get; set; }

        // Faltavam essas propriedades aqui:
        public int Numero { get; set; }
        public int Status { get; set; } // 0 = Livre, 1 = Ocupada
        public decimal CustoTotal { get; set; }
    }
}