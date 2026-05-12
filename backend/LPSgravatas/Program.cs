using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DotNetEnv;
using BCrypt.Net;

// 1. Carrega o arquivo .env
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Pega a string de conexão do .env
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION")
                       ?? DotNetEnv.Env.GetString("DB_CONNECTION");

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("Erro crítico: Variável DB_CONNECTION não encontrada!");
    return;
}

// Configura o banco de dados MySQL no Entity Framework
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configurações do Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{ 
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();


app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ====================================================================
// ROTAS DA API
// ====================================================================

app.MapPost("/cadastrar", async (AppDbContext db, Usuario novoUsuario) =>
{
    // Verifica se o email já está cadastrado
    var emailExistente = await db.Usuarios.AnyAsync(u => u.Email == novoUsuario.Email);
    if (emailExistente)
        return Results.Conflict(new { mensagem = "Email já cadastrado." });

    novoUsuario.Senha = BCrypt.Net.BCrypt.HashPassword(novoUsuario.Senha);

    db.Usuarios.Add(novoUsuario);
    await db.SaveChangesAsync();

    return Results.Created($"/usuarios/{novoUsuario.IdUser}", new
    {
        novoUsuario.IdUser,
        novoUsuario.Nome,
        novoUsuario.Email
    });
});

app.MapPost("/login", async (AppDbContext db, LoginRequest login) =>
{
    // Busca o usuário pelo email
    var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == login.Email);

    // Usuário não encontrado
    if (usuario is null)
        return Results.Unauthorized();

    // Verifica se a senha está correta
    var senhaCorreta = BCrypt.Net.BCrypt.Verify(login.Senha, usuario.Senha);
    if (!senhaCorreta)
        return Results.Unauthorized();

    // Login bem-sucedido
    return Results.Ok(new
    {
        mensagem = "Login realizado com sucesso!",
        usuario.IdUser,
        usuario.Nome,
        usuario.Email
    });
});

app.MapGet("/usuarios", async (AppDbContext db) =>
{
    var listaUsuarios = await db.Usuarios
        .Select(u => new { u.IdUser, u.Nome, u.Email }) // Não envia a senha!
        .ToListAsync();
    return Results.Ok(listaUsuarios);
});

app.Run();

// ====================================================================
// CLASSES DE MODELO E BANCO DE DADOS
// ====================================================================

[Table("Users")]
public class Usuario
{
    [Key]
    public int IdUser { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
}

// Classe separada para o login (não precisa de todos os campos do Usuario)
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Usuario> Usuarios { get; set; }
}
