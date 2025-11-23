using System.ComponentModel.DataAnnotations.Schema;

namespace ProjetoIntegrador.Entities
{
    public class PedidoDelivery
    {
        public long Id { get; set; }

        // Dados do Cliente
        public string NomeCliente { get; set; }
        public string Telefone { get; set; }
        public string Endereco { get; set; }

        // Dados do Pedido
        public string ItensResumo { get; set; } // Ex: "1x Pizza, 2x Coca" (Salvamos como texto pra facilitar)
        public decimal ValorTotal { get; set; }
        public string FormaPagamento { get; set; }

        // Controle
        public DateTime DataPedido { get; set; }
        public int Status { get; set; } // 0=Recebido, 1=Saiu para Entrega, 2=Entregue

        public long? PratoId { get; set; }

        [ForeignKey("PratoId")]
        public virtual Prato Prato { get; set; }
    }
}