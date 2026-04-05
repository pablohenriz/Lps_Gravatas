using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURAÇÃO DO MYSQL ---
// Substitua os dados abaixo pelos do seu banco (geralmente local)
var connectionString = "server=localhost;database=LPS_Gravataria;user=pablo;password=3544";
var serverVersion = new MySqlServerVersion(new Version(8, 0, 31)); // Verifique sua versão do MySQL

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));
// -----------------------------

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
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
        context.Usuarios.Add(novoUsuario);
        await context.SaveChangesAsync();
        return Results.Ok(new { mensagem = "Usuário salvo no MySQL!" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { erro = ex.Message });
    }
});

app.Run();

// MODELOS
public record Usuario(string Nome, string Email, string Senha, string? Telefone);

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>().HasKey(u => u.Email);
        
        // Dica: No MySQL, é bom definir o tamanho máximo de strings que são chaves
        modelBuilder.Entity<Usuario>().Property(u => u.Email).HasMaxLength(150);
    }
}