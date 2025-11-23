using Microsoft.EntityFrameworkCore;
using ProjetoIntegrador.Database;
using ProjetoIntegrador.Mappers;
using ProjetoIntegrador.Repositories;
using ProjetoIntegrador.Repositories.RepositoryBase;
using ProjetoIntegrador.Service;


AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ProjetoIntegradorDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSignalR();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddScoped<IIngredienteRepository, IngredienteRepository>();
builder.Services.AddScoped<IIngredienteService, IngredienteService>();

builder.Services.AddScoped<IPratoRepository, PratoRepository>();
builder.Services.AddScoped<IPratoService, PratoService>();

builder.Services.AddScoped<IMesaRepository, MesaRepository>();
builder.Services.AddScoped<IMesaService, MesaService>();

builder.Services.AddScoped<IFuncionarioRepository, FuncionarioRepository>();
builder.Services.AddScoped<IFuncionarioService, FuncionarioService>();

builder.Services.AddScoped<IPratoIngredienteRepository, PratoIngredienteRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Registrando os serviços de Reserva (Adicione estas linhas)
builder.Services.AddScoped<IReservaRepository, ReservaRepository>();
builder.Services.AddScoped<IReservaService, ReservaService>();

// Adiciona a política de CORS (Permite o Front acessar)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();


// Ativa o CORS
app.UseCors("AllowAll");
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapHub<PedidoHub>("/pedidosHub");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
