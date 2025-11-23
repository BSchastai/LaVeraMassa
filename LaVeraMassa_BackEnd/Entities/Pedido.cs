using System.ComponentModel.DataAnnotations.Schema;

namespace ProjetoIntegrador.Entities
{
    public class Pedido
    {
        public long Id { get; set; }
        public int Status { get; set; }
        public string Descricao { get; set; }
        public string Observacao { get; set; }
        public int Quantidade { get; set; } // Certifique-se que existe

        // RELACIONAMENTOS (Essenciais para não dar erro 500)
        public long MesaId { get; set; }

        [ForeignKey("MesaId")]
        public virtual Mesa Mesa { get; set; } // <--- TEM QUE TER ISSO

        public long PratoId { get; set; } // Se tiver nullable no banco, use long?

        [ForeignKey("PratoId")]
        public virtual Prato Prato { get; set; } // <--- TEM QUE TER ISSO
    }
}