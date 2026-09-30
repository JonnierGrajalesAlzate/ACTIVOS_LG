using Microsoft.Data.SqlClient;

namespace ActivosLG.Api.Data;

public class SqlConnectionFactory(IConfiguration configuration) : IDbConnectionFactory
{
    public SqlConnection CreateConnection()
    {
        var connectionString = configuration["CONNECTION_STRING"];
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("CONNECTION_STRING no esta configurada. Revisa el archivo .env");
        }

        return new SqlConnection(connectionString);
    }
}
