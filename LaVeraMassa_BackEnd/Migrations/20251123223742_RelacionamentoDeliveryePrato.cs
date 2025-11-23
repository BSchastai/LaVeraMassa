using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjetoIntegrador.Migrations
{
    /// <inheritdoc />
    public partial class RelacionamentoDeliveryePrato : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "PratoId",
                table: "PedidosDelivery",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PedidosDelivery_PratoId",
                table: "PedidosDelivery",
                column: "PratoId");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidosDelivery_Pratos_PratoId",
                table: "PedidosDelivery",
                column: "PratoId",
                principalTable: "Pratos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PedidosDelivery_Pratos_PratoId",
                table: "PedidosDelivery");

            migrationBuilder.DropIndex(
                name: "IX_PedidosDelivery_PratoId",
                table: "PedidosDelivery");

            migrationBuilder.DropColumn(
                name: "PratoId",
                table: "PedidosDelivery");
        }
    }
}
