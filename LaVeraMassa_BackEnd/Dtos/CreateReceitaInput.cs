namespace ProjetoIntegrador.Dtos
{
    public class CreateReceitaInput
    {
        public int Pessoa { get; set; }
        public DateOnly Data { get; set; }
        public TimeOnly Horario { get; set; }
        public string Telefone { get; set; }
        public string Email { get; set; }
        public string Nome { get; set; }
    }
}
