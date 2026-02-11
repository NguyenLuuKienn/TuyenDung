using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class LocalFileStorageServices : IFileStorageServices
    {
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public LocalFileStorageServices(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<string> UploadFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty.");
            }

            // Tạo đường dẫn thư mục lưu trữ (ví dụ: wwwroot/uploads/resumes)
            // WebRootPath may be null in some hosting scenarios; fall back to ContentRootPath/wwwroot
            var webRoot = _env.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(_env.ContentRootPath ?? string.Empty, "wwwroot");
            }
            var uploadPath = Path.Combine(webRoot, "uploads", folderName);
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            // Tạo tên file duy nhất để tránh trùng lặp
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            // Lưu file vào server
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về URL công khai để truy cập file
            var request = _httpContextAccessor.HttpContext.Request;
            var fileUrl = $"{request.Scheme}://{request.Host}/uploads/{folderName}/{fileName}";

            return fileUrl;
        }
    }
}
