using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DotNetEnv; // 1. IMPORTAR O DOTNETENV
using BCrypt.Net; // 2. IMPORTAR O BCRYPT

// 3. CARREGAR O ARQUIVO .ENV (Isso deve vir antes do builder)
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin() // Em produção, especifique a URL exata
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// --- CONFIGURAÇÃO DO MYSQL ---
// 4. PEGAR A STRING REAL DA VARIÁVEL DE AMBIENTE
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION")?.Trim();
var serverVersion = new MySqlServerVersion(new Version(8, 4, 8));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));
// -----------------------------

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => 
    policy.AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ROTA DE CADASTRO
app.MapPost("/api/cadastrar", async ([FromBody] Usuario novoUsuario, AppDbContext context) =>
{
    try
    {
        // 5. CRIPTOGRAFAR A SENHA ANTES DE SALVAR
        string senhaComHash = BCrypt.Net.BCrypt.HashPassword(novoUsuario.Senha);

        // Criamos uma cópia do usuário com a nova senha segura
        var usuarioSeguro = novoUsuario with { Senha = senhaComHash };

        context.Usuarios.Add(usuarioSeguro);
        await context.SaveChangesAsync();

        return Results.Ok(new { mensagem = "Usuário salvo com segurança no MySQL!" });
    }
    catch (Exception)
    {
        // 6. DICA: Em produção, evite retornar ex.Message diretamente
        return Results.BadRequest(new { erro = "Não foi possível realizar o cadastro." });
    }
});

app.MapPost("/api/login", async ([FromBody] Usuario loginUsuario, AppDbContext context) =>
{
    try
    {
        var usuarioNoBanco = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == loginUsuario.Email);
        if (usuarioNoBanco == null || !BCrypt.Net.BCrypt.Verify(loginUsuario.Senha, usuarioNoBanco.Senha))
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new { mensagem = "Login bem-sucedido!" });
    }
    catch (Exception)
    {
        return Results.BadRequest(new { erro = "Não foi possível realizar o login." });
    }
});

app.Run();

// MODELOS
public record Usuario(
    string Nome,
    string Email,
    string Senha,
    string? Telefone
);

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // O nome aqui deve ser igual ao da tabela no MySQL
    public DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>().ToTable("Users");

        // Indica que o IdUser existe no banco e é gerado automaticamente
        modelBuilder.Entity<Usuario>()
            .Property<int>("IdUser")
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<Usuario>().HasKey(u => u.Email);
    }
}