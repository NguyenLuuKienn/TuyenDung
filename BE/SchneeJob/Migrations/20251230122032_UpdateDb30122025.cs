using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchneeJob.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDb30122025 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverImageURL",
                table: "CompanyRegistrations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LogoURL",
                table: "CompanyRegistrations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImageURL",
                table: "CompanyRegistrations");

            migrationBuilder.DropColumn(
                name: "LogoURL",
                table: "CompanyRegistrations");
        }
    }
}
