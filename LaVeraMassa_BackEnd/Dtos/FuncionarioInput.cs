using ProjetoIntegrador.Entities;
using ProjetoIntegrador.Enums;
using System.ComponentModel.DataAnnotations;

namespace ProjetoIntegrador.Dtos {
    public class FuncionarioInput {
        public string Nome {  get; set; }  //verificar mudança

        public string Senha { get; set; }

        public FuncaoEnum Funcao { get; set; }
    }
}
