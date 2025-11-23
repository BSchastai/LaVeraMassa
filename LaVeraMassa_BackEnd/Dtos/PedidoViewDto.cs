namespace ProjetoIntegrador.Dtos
{
    public class PedidoViewDto
    {
        public long Id { get; set; }
        public int MesaNumero { get; set; }
        public string NomePrato { get; set; }
        public string Observacao { get; set; }
        public int Status { get; set; } // 0=Fila, 1=Preparo, 2=Pronto
        public int Quantidade { get; set; }
    }
}