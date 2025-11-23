using Microsoft.AspNetCore.Mvc;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Repositories.RepositoryBase;
using ProjetoIntegrador.Service;

namespace ProjetoIntegrador.Controllers
{
    [ApiController]
    [Route("api/web/[controller]")]
    public class IngredienteController : ControllerBase
    {
        private readonly IIngredienteService _ingredienteService;
        private readonly IUnitOfWork _unitOfWork;

        // Construtor injetando as dependências
        public IngredienteController(IIngredienteService ingredienteService, IUnitOfWork unitOfWork)
        {
            _ingredienteService = ingredienteService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost]
        [Route("cria-ingrediente")]
        public async Task<IActionResult> CreateIngrediente(CreateIngredienteInput input)
        {
            // O Service cria e devolve o objeto criado (com ID)
            var ingrediente = await _ingredienteService.CreateIngrediente(input);

            // AQUI O PULO DO GATO: Retornamos o objeto inteiro (com o ID) para o Front
            return Ok(ingrediente);
        }

        [HttpGet]
        [Route("lista")]
        public async Task<IActionResult> GetAllIngredientes()
        {
            // Busca todos os ingredientes do banco
            var lista = await _unitOfWork.Ingredientes.GetAllAsync();
            return Ok(lista);
        }

        [HttpPut]
        [Route("atualiza-ingrediente")]
        public async Task<IActionResult> UpdateIngrediente(UpdateIngredientes input)
        {
            // Lógica de atualização (depende do seu Service ou Repository)
            var ingrediente = await _ingredienteService.UpdateIngrediente(input);
            return Ok(ingrediente);
        }

        [HttpDelete]
        [Route("deleta")]
        public async Task<IActionResult> DeleteIngrediente([FromQuery] long id)
        {
            var item = await _unitOfWork.Ingredientes.GetByIdAsync(id);

            if (item == null)
                return NotFound("Ingrediente não encontrado");

            _unitOfWork.Ingredientes.Delete(item);

            // Salva a exclusão no banco
            await _unitOfWork.CompleteAsync();

            return Ok("Ingrediente deletado com sucesso");
        }
    }
}