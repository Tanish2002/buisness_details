import { useIsSubmitting } from "remix-validated-form";

export const SubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
      {isSubmitting ? (
        <div>
          <span className="loading loading-spinner"></span>
          Submitting...
        </div>
      ) : (
        "Submit"
      )}
    </button>
  );
};
