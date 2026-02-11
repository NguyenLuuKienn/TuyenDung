namespace SchneeJob.Interfaces
{
    public interface ICompanyReviewServices
    {
        Task<IEnumerable<CompanyReview>> GetReviewsForCompanyAsync(Guid companyId);

        Task<CompanyReview> CreateReviewAsync(CompanyReview review, Guid userId);

        Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId);
    }
}
