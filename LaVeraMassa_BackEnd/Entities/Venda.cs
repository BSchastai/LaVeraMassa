using System;

namespace ProjetoIntegrador.Entities
{
    public class Venda
    {
        public long Id { get; set; }
        public decimal ValorTotal { get; set; }
        public DateTime DataVenda { get; set; }
        public string FormaPagamento { get; set; } // Ex: "Dinheiro", "Pix" (Opcional por enquanto)
    }
}