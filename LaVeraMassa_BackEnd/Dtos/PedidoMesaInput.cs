namespace ProjetoIntegrador.Dtos
{
    public class PedidoMesaInput
    {
        public long MesaId { get; set; }
        public long PratoId { get; set; }
        public int Quantidade { get; set; }
        public string Observacao { get; set; }
    }
}