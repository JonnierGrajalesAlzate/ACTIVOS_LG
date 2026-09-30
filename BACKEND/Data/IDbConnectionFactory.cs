using Microsoft.Data.SqlClient;

namespace ActivosLG.Api.Data;

public interface IDbConnectionFactory
{
    SqlConnection CreateConnection();
}
