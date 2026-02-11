using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SchneeJob.Hubs;
using SchneeJob.Interfaces;
using SchneeJob.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Prevent JSON serializer errors when entity graphs contain cycles
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.MaxDepth = 64;
    });

builder.Services.AddDbContext<SchneeJobDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SchneeJobDb")));

builder.Services.AddHttpContextAccessor();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),

        ClockSkew = TimeSpan.Zero // kh�ng delay 5 ph�t default
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            // If the request is for our hub...
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/chathub")))
            {
                // Read the token out of the query string
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});


builder.Services.AddScoped<ISkillServices, SkillServices>();
builder.Services.AddScoped<IIndustriesServices, IndustriesServices>();
builder.Services.AddScoped<IEducationLevelServices, EducationLevelServices>();
builder.Services.AddScoped<IJobServices, JobServices>();
builder.Services.AddScoped<IUserServices, UserServices>();
builder.Services.AddScoped<IJobSeekerProfileServices, JobSeekerProfileServices>();
builder.Services.AddScoped<IApplicationServices, ApplicationServices>();
builder.Services.AddScoped<IResumeServices, ResumeServices>();
builder.Services.AddScoped<ICompanyFollowServices, CompanyFollowServices>();
builder.Services.AddScoped<ISavedJobServices, SavedJobServices>();
builder.Services.AddScoped<ICompanyReviewServices, CompanyReviewServices>();
builder.Services.AddScoped<INotificationServices, NotificationServices>();
builder.Services.AddScoped<IMatchingServices, MatchingServices>();
builder.Services.AddScoped<DashboardServices, DashboardServices>();
builder.Services.AddScoped<IAdminServices, AdminServices>();
builder.Services.AddScoped<IChatServices, ChatServices>();
builder.Services.AddScoped<ICompanyServices, CompanyServices>();
builder.Services.AddScoped<LocalFileStorageServices, LocalFileStorageServices>();
builder.Services.AddSingleton<IFileStorageServices, LocalFileStorageServices>();
builder.Services.AddScoped<IRoleServices, RoleServices>();
builder.Services.AddScoped<ICompanyRegistrationServices, CompanyRegistrationServices>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IMessageService, MessageService>();

builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",      // Vite dev server
                "http://localhost:3000",      // Alternative port
                "https://localhost:5173",
                "https://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS before authentication
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/chathub");

app.Run();
