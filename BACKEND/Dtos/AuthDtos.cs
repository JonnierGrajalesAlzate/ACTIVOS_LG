namespace ActivosLG.Api.Dtos;

public record LoginRequestDto(string Email, string Password);

public record UsuarioDto(int Id, string Email, string Nombre, string Rol);

public record LoginResponseDto(string Token, DateTime ExpiraEn, UsuarioDto Usuario);

public record ResetPasswordRequestDto(string Email, string NewPassword);
