namespace SchneeJob.Interfaces
{
    public interface IFileStorageServices
    {
        Task<string> UploadFileAsync(IFormFile file, string folderName);
    }
}
