using Microsoft.AspNetCore.Mvc;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Repositories.RepositoryBase;
using ProjetoIntegrador.Service;

namespace ProjetoIntegrador.Controllers
{
    [ApiController]
    [Route("api/web/[controller]")]
    public class FuncionarioController : ControllerBase
    {
        private readonly IFuncionarioService _funcionarioService;
        private readonly IUnitOfWork _unitOfWork;

        public FuncionarioController(IFuncionarioService funcionarioService, IUnitOfWork unitOfWork)
        {
            _funcionarioService = funcionarioService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost]
        [Route("cria-funcionario")]
        public async Task<IActionResult> CreateFuncionario(FuncionarioInput input)
        {
            // 1. Use o nome EXATO que está na interface (CreatFuncionario)
            // 2. O retorno é um booleano (sucesso ou falha)
            var sucesso = await _funcionarioService.CreatFuncionario(input);

            if (sucesso)
            {
                return Ok("Funcionário criado com sucesso!");
            }
            else
            {
                return BadRequest("Erro ao criar funcionário.");
            }
        }

        // === ROTA DE LOGIN (NOVA) ===
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            // 1. Busca todos os funcionários
            var todos = await _unitOfWork.Funcionario.GetAllAsync();

            // 2. Procura alguém com esse Nome E Senha
            var usuario = todos.FirstOrDefault(x => x.Nome == login.Nome && x.Senha == login.Senha);

            if (usuario == null)
            {
                return Unauthorized("Usuário ou senha incorretos.");
            }

            // 3. Devolve os dados do usuário (incluindo se é gerente ou não)
            return Ok(usuario);
        }

        // === NOVO: LISTAR TODOS ===
        [HttpGet]
        [Route("lista")]
        public async Task<IActionResult> GetAllFuncionarios()
        {
            var lista = await _unitOfWork.Funcionario.GetAllAsync();
            return Ok(lista);
        }

        // === NOVO: DELETAR (DEMITIR) ===
        [HttpDelete]
        [Route("deleta")]
        public async Task<IActionResult> DeleteFuncionario([FromQuery] long id)
        {
            var func = await _unitOfWork.Funcionario.GetByIdAsync(id);

            if (func == null) return NotFound("Funcionário não encontrado.");

            _unitOfWork.Funcionario.Delete(func);
            await _unitOfWork.CompleteAsync();

            return Ok("Funcionário removido com sucesso.");
        }

        // Obs: O Login continua existindo no Service/Outra rota se já foi feito.
    }
}