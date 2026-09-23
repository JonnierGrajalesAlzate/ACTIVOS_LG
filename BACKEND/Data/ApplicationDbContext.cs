using System;
using System.Collections.Generic;
using ActivosLG.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ActivosLG.Api.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Administracion> Administracions { get; set; }

    public virtual DbSet<Arrendador> Arrendadors { get; set; }

    public virtual DbSet<Arrendatario> Arrendatarios { get; set; }

    public virtual DbSet<CategoriaMarca> CategoriaMarcas { get; set; }

    public virtual DbSet<ContratosArrendamiento> ContratosArrendamientos { get; set; }

    public virtual DbSet<Destinacion> Destinacions { get; set; }

    public virtual DbSet<EgresosMensuale> EgresosMensuales { get; set; }

    public virtual DbSet<Estado> Estados { get; set; }

    public virtual DbSet<Etapa> Etapas { get; set; }

    public virtual DbSet<HistorialIncrementoCanon> HistorialIncrementosCanon { get; set; }

    public virtual DbSet<Inmueble> Inmuebles { get; set; }

    public virtual DbSet<Leasing> Leasings { get; set; }

    public virtual DbSet<Marca> Marcas { get; set; }

    public virtual DbSet<Parametro> Parametros { get; set; }

    public virtual DbSet<Proyecto> Proyectos { get; set; }

    public virtual DbSet<Seguro> Seguros { get; set; }

    public virtual DbSet<ServiciosPublico> ServiciosPublicos { get; set; }

    public virtual DbSet<TipoInmueble> TipoInmuebles { get; set; }

    public virtual DbSet<TipoLocal> TipoLocals { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Administracion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__administ__3213E83FD7C323BF");

            entity.ToTable("administracion");

            entity.HasIndex(e => e.IdInmueble, "IX_ADMINISTRACION_INMUEBLE");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Fecha).HasColumnName("fecha");
            entity.Property(e => e.IdInmueble).HasColumnName("id_inmueble");
            entity.Property(e => e.PorcentCanonArriendo)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("porcent_canon_arriendo");
            entity.Property(e => e.ValorMensual)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("valor_mensual");

            entity.HasOne(d => d.IdInmuebleNavigation).WithMany(p => p.Administracions)
                .HasForeignKey(d => d.IdInmueble)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ADMINISTRACION_INMUEBLE");
        });

        modelBuilder.Entity<Arrendador>(entity =>
        {
            entity.HasKey(e => e.Nit).HasName("PK__arrendad__DF97D0E537182876");

            entity.ToTable("arrendador");

            entity.Property(e => e.Nit)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("nit");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Arrendatario>(entity =>
        {
            entity.HasKey(e => e.Nit).HasName("PK__arrendat__DF97D0E5671F83D5");

            entity.ToTable("arrendatario");

            entity.Property(e => e.Nit)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("nit");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<CategoriaMarca>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__categori__3213E83F2FC2E4E0");

            entity.ToTable("categoria_marca");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<ContratosArrendamiento>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__contrato__3213E83F250C004F");

            entity.ToTable("contratos_arrendamiento");

            entity.HasIndex(e => e.IdInmueble, "IX_CONTRATO_INMUEBLE");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AdmonIncrementaCanon)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("admon_incrementa_canon");
            entity.Property(e => e.CanonActualMensual)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("canon_actual_mensual");
            entity.Property(e => e.ComisionEntidad)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("comision_entidad");
            entity.Property(e => e.FechaContrato).HasColumnName("fecha_contrato");
            entity.Property(e => e.IdInmueble).HasColumnName("id_inmueble");
            entity.Property(e => e.IdMarca).HasColumnName("id_marca");
            entity.Property(e => e.IdSeguro).HasColumnName("id_seguro");
            entity.Property(e => e.IncrementoAnual)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("incremento_anual");
            entity.Property(e => e.NitArrendador)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("nit_arrendador");
            entity.Property(e => e.NitArrendatario)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("nit_arrendatario");
            entity.Property(e => e.Observaciones)
                .IsUnicode(false)
                .HasColumnName("observaciones");
            entity.Property(e => e.PlazoAnios).HasColumnName("plazo_anios");
            entity.Property(e => e.PorcentSeguro)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("porcent_seguro");
            entity.Property(e => e.PorcentajeCanonVariable)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("porcentaje_canon_variable");
            entity.Property(e => e.PorcentajeComisionEntidad)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("porcentaje_comision_entidad");
            entity.Property(e => e.PorcentajeVentas)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("porcentaje_ventas");
            entity.Property(e => e.ProximoIncremento).HasColumnName("proximo_incremento");
            entity.Property(e => e.ProximoVencimiento).HasColumnName("proximo_vencimiento");
            entity.Property(e => e.PuntosAdicionalesIpc)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("puntos_adicionales_ipc");
            entity.Property(e => e.RentalRate)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("rental_rate");
            entity.Property(e => e.TipoCanon)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("tipo_canon");
            entity.Property(e => e.TipoIncrementoActual)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("tipo_incremento_actual");
            entity.Property(e => e.ValorM2Canon)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("valor_m2_canon");
            entity.Property(e => e.ValorReembolsoAdmon)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("valor_reembolso_admon");
            entity.Property(e => e.VtoPrimeraVigencia).HasColumnName("vto_primera_vigencia");

            entity.HasOne(d => d.IdInmuebleNavigation).WithMany(p => p.ContratosArrendamientos)
                .HasForeignKey(d => d.IdInmueble)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CONTRATO_INMUEBLE");

            entity.HasOne(d => d.IdMarcaNavigation).WithMany(p => p.ContratosArrendamientos)
                .HasForeignKey(d => d.IdMarca)
                .HasConstraintName("FK_CONTRATO_MARCA");

            entity.HasOne(d => d.IdSeguroNavigation).WithMany(p => p.ContratosArrendamientos)
                .HasForeignKey(d => d.IdSeguro)
                .HasConstraintName("FK_CONTRATO_SEGURO");

            entity.HasOne(d => d.NitArrendadorNavigation).WithMany(p => p.ContratosArrendamientos)
                .HasForeignKey(d => d.NitArrendador)
                .HasConstraintName("FK_CONTRATO_ARRENDADOR");

            entity.HasOne(d => d.NitArrendatarioNavigation).WithMany(p => p.ContratosArrendamientos)
                .HasForeignKey(d => d.NitArrendatario)
                .HasConstraintName("FK_CONTRATO_ARRENDATARIO");
        });

        modelBuilder.Entity<Destinacion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__destinac__3213E83F155C849A");

            entity.ToTable("destinacion");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("descripcion");
        });

        modelBuilder.Entity<EgresosMensuale>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__egresos___3213E83F804DE4EA");

            entity.ToTable("egresos_mensuales");

            entity.HasIndex(e => e.IdInmueble, "IX_EGRESO_INMUEBLE");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CamVacante)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("cam_vacante");
            entity.Property(e => e.ComisionAdministracionInmobiliaria)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("comision_administracion_inmobiliaria");
            entity.Property(e => e.ComisionFiduciaria)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("comision_fiduciaria");
            entity.Property(e => e.Ebitda)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("ebitda");
            entity.Property(e => e.GravamenMovimientosFinancieros)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("gravamen_movimientos_financieros");
            entity.Property(e => e.IdInmueble).HasColumnName("id_inmueble");
            entity.Property(e => e.MantenimientoMenor)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("mantenimiento_menor");
            entity.Property(e => e.NumeroContratoServicio)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("numero_contrato_servicio");
            entity.Property(e => e.PredialMensual)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("predial_mensual");
            entity.Property(e => e.ReembolsosTerceros)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("reembolsos_terceros");
            entity.Property(e => e.RentabilidadCapRate)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("rentabilidad_cap_rate");
            entity.Property(e => e.SeguroArriendo)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("seguro_arriendo");
            entity.Property(e => e.TotalEgresos)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_egresos");

            entity.HasOne(d => d.IdInmuebleNavigation).WithMany(p => p.EgresosMensuales)
                .HasForeignKey(d => d.IdInmueble)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_EGRESO_INMUEBLE");

            entity.HasOne(d => d.NumeroContratoServicioNavigation).WithMany(p => p.EgresosMensuales)
                .HasForeignKey(d => d.NumeroContratoServicio)
                .HasConstraintName("FK_EGRESO_SERVICIO");
        });

        modelBuilder.Entity<Estado>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__estado__3213E83F434CE1E1");

            entity.ToTable("estado");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("descripcion");
        });

        modelBuilder.Entity<Parametro>(entity =>
        {
            entity.HasKey(e => e.Clave).HasName("PK_parametro");

            entity.ToTable("parametro");

            entity.Property(e => e.Clave)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("clave");
            entity.Property(e => e.Valor)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("valor");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.FechaActualizacion)
                .HasColumnName("fecha_actualizacion")
                .HasDefaultValueSql("sysutcdatetime()");
            entity.Property(e => e.ActualizadoPor)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("actualizado_por");
        });

        modelBuilder.Entity<HistorialIncrementoCanon>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_historial_incremento_canon");

            entity.ToTable("historial_incremento_canon");

            entity.HasIndex(e => e.IdContrato, "IX_HISTORIAL_INCREMENTO_CONTRATO");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdContrato).HasColumnName("id_contrato");
            entity.Property(e => e.FechaIncremento).HasColumnName("fecha_incremento");
            entity.Property(e => e.CanonAnterior)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("canon_anterior");
            entity.Property(e => e.CanonNuevo)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("canon_nuevo");
            entity.Property(e => e.Ipc)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("ipc");
            entity.Property(e => e.PuntosAdicionales)
                .HasColumnType("decimal(10, 4)")
                .HasColumnName("puntos_adicionales");
            entity.Property(e => e.FechaAplicacion)
                .HasColumnName("fecha_aplicacion")
                .HasDefaultValueSql("sysutcdatetime()");
            entity.Property(e => e.AplicadoPor)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("aplicado_por");

            entity.HasOne(d => d.IdContratoNavigation).WithMany()
                .HasForeignKey(d => d.IdContrato)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_HISTORIAL_INCREMENTO_CONTRATO");
        });

        modelBuilder.Entity<Etapa>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_etapa");

            entity.ToTable("etapa");

            entity.HasIndex(e => new { e.IdProyecto, e.Nombre }, "UQ_etapa_proyecto_nombre").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdProyecto).HasColumnName("id_proyecto");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("nombre");

            entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.Etapas)
                .HasForeignKey(d => d.IdProyecto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ETAPA_PROYECTO");
        });

        modelBuilder.Entity<Inmueble>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__inmueble__3213E83FC0273E24");

            entity.ToTable("inmueble");

            entity.HasIndex(e => e.IdProyecto, "IX_INMUEBLE_PROYECTO");

            entity.HasIndex(e => e.IdEtapa, "IX_INMUEBLE_ETAPA");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AreaLibrePriv)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("area_libre_priv");
            entity.Property(e => e.AreaPiso1)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("area_piso1");
            entity.Property(e => e.AvaluoCatastral)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("avaluo_catastral");
            entity.Property(e => e.Coeficiente)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("coeficiente");
            entity.Property(e => e.IdDestinacion).HasColumnName("id_destinacion");
            entity.Property(e => e.IdEstado).HasColumnName("id_estado");
            entity.Property(e => e.IdEtapa).HasColumnName("id_etapa");
            entity.Property(e => e.IdProyecto).HasColumnName("id_proyecto");
            entity.Property(e => e.IdTipoInmueble).HasColumnName("id_tipo_inmueble");
            entity.Property(e => e.IdTipoLocal).HasColumnName("id_tipo_local");
            entity.Property(e => e.MatriculaInmobiliaria)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("matricula_inmobiliaria");
            entity.Property(e => e.Mesanine)
                .HasDefaultValue(false)
                .HasColumnName("mesanine");
            entity.Property(e => e.Nivel)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("nivel");
            entity.Property(e => e.NumeroLocal)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("numero_local");
            entity.Property(e => e.Observaciones)
                .IsUnicode(false)
                .HasColumnName("observaciones");
            entity.Property(e => e.Pisos).HasColumnName("pisos");
            entity.Property(e => e.PorcentValorCatastral)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("porcent_valor_catastral");
            entity.Property(e => e.PorcentajeCatastral)
                .HasColumnType("decimal(8, 4)")
                .HasColumnName("porcentaje_catastral");
            entity.Property(e => e.PredialAnual)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("predial_anual");
            entity.Property(e => e.TarifaCatastro)
                .HasColumnType("decimal(8, 4)")
                .HasColumnName("tarifa_catastro");
            entity.Property(e => e.ValorComercial)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("valor_comercial");
            entity.Property(e => e.ValorM2Admon).HasColumnName("valor_m2_admon");
            entity.Property(e => e.ValorM2Construido)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("valor_m2_construido");
            entity.Property(e => e.ValorPredialAnual).HasColumnName("valor_predial_anual");

            entity.HasOne(d => d.IdDestinacionNavigation).WithMany(p => p.Inmuebles)
                .HasForeignKey(d => d.IdDestinacion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_INMUEBLE_DESTINACION");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.Inmuebles)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_INMUEBLE_ESTADO");

            entity.HasOne(d => d.IdEtapaNavigation).WithMany(p => p.Inmuebles)
                .HasForeignKey(d => d.IdEtapa)
                .HasConstraintName("FK_INMUEBLE_ETAPA");

            entity.HasOne(d => d.IdProyectoNavigation).WithMany(p => p.Inmuebles)
                .HasForeignKey(d => d.IdProyecto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_INMUEBLE_PROYECTO");

            entity.HasOne(d => d.IdTipoInmuebleNavigation).WithMany(p => p.Inmuebles)
                .HasForeignKey(d => d.IdTipoInmueble)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_INMUEBLE_TIPO_INMUEBLE");

            entity.HasOne(d => d.IdTipoLocalNavigation).WithMany(p => p.Inmuebles)
                .HasForeignKey(d => d.IdTipoLocal)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_INMUEBLE_TIPO_LOCAL");
        });

        modelBuilder.Entity<Leasing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__leasing__3213E83F77E09BED");

            entity.ToTable("leasing");

            entity.HasIndex(e => e.IdInmueble, "IX_LEASING_INMUEBLE");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CuotaLeasing).HasColumnName("cuota_leasing");
            entity.Property(e => e.EntidadLeasing)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("entidad_leasing");
            entity.Property(e => e.FechaSaldoLeasing).HasColumnName("fecha_saldo_leasing");
            entity.Property(e => e.FechaVtoLeasing).HasColumnName("fecha_vto_leasing");
            entity.Property(e => e.IdInmueble).HasColumnName("id_inmueble");
            entity.Property(e => e.Observaciones)
                .IsUnicode(false)
                .HasColumnName("observaciones");
            entity.Property(e => e.ValorActLeasing).HasColumnName("valor_act_leasing");
            entity.Property(e => e.ValorLeasing)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("valor_leasing");
            entity.Property(e => e.ValorRecompra)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("valor_recompra");

            entity.HasOne(d => d.IdInmuebleNavigation).WithMany(p => p.Leasings)
                .HasForeignKey(d => d.IdInmueble)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LEASING_INMUEBLE");
        });

        modelBuilder.Entity<Marca>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__marca__3213E83F2E5B4CFF");

            entity.ToTable("marca");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Clasificacion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("clasificacion");
            entity.Property(e => e.IdCategoria).HasColumnName("id_categoria");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");

            entity.HasOne(d => d.IdCategoriaNavigation).WithMany(p => p.Marcas)
                .HasForeignKey(d => d.IdCategoria)
                .HasConstraintName("FK_MARCA_CATEGORIA");
        });

        modelBuilder.Entity<Proyecto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__proyecto__3213E83F6D089F67");

            entity.ToTable("proyecto");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Seguro>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__seguro__3213E83F90FBE598");

            entity.ToTable("seguro");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<ServiciosPublico>(entity =>
        {
            entity.HasKey(e => e.NumeroContrato).HasName("PK__servicio__79CE842B4B3152EC");

            entity.ToTable("servicios_publicos");

            entity.Property(e => e.NumeroContrato)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("numero_contrato");
            entity.Property(e => e.Precio)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("precio");
        });

        modelBuilder.Entity<TipoInmueble>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__tipo_inm__3213E83F6A47C999");

            entity.ToTable("tipo_inmueble");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("descripcion");
        });

        modelBuilder.Entity<TipoLocal>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__tipo_loc__3213E83F6780E00A");

            entity.ToTable("tipo_local");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("descripcion");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_usuario");

            entity.ToTable("usuario");

            entity.HasIndex(e => e.Email, "UQ_usuario_email").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("password_hash");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Rol)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("rol")
                .HasDefaultValue("lectura");
            entity.Property(e => e.Activo)
                .HasColumnName("activo")
                .HasDefaultValue(true);
            entity.Property(e => e.FechaCreacion)
                .HasColumnName("fecha_creacion")
                .HasDefaultValueSql("sysutcdatetime()");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
