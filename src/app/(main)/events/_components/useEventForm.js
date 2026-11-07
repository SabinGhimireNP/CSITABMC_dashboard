import { useState, useEffect } from "react";
import { eventSchema } from "@/lib/Schema/eventSchema";

/**
 * useEventForm manages the form state, validation, media preview, and submission
 * workflows for creating or editing events.
 */
export function useEventForm({ initialData = null }) {
  const [formData, setFormData] = useState(() => {
    // Start from the event's existing assignments so roles survive edit/duplicate.
    const initialAssignments = Array.isArray(initialData?.mentor_assignments)
      ? initialData.mentor_assignments.map((a) => ({
          mentor_id: a.mentor_id,
          mentor_name: a.mentor_name || "",
          role: a.role || "main_mentor",
          custom_role: a.custom_role || "",
          responsibility: a.responsibility || "",
        }))
      : [];

    return {
      title: initialData?.title || "",
      registrationOpen: initialData?.registrationOpen ?? true,
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      organizer: initialData?.organizer || "",
      availableSeats: initialData?.availableSeats ?? "",
      registrationFormUrl: initialData?.registrationFormUrl || "",
      registrationFeeBMC: initialData?.registrationFeeBMC ?? "",
      registrationFee: initialData?.registrationFee ?? "",
      location: initialData?.location || "",
      category: initialData?.category || "",
      status: initialData?.status || "published",
      tags: Array.isArray(initialData?.tags)
        ? initialData.tags.join(", ")
        : initialData?.tags || "",
      image: undefined,
      description: initialData?.description || "",
      assignments: initialAssignments,
      tenure: initialData?.tenure || initialData?.tenureId || "",
    };
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);
  const [fileMeta, setFileMeta] = useState(() => ({
    preview: initialData?.image || null,
    name: initialData?.image ? "Attached Event Image" : "",
  }));

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
      const reader = new FileReader();
      reader.onloadend = () =>
        setFileMeta({ preview: reader.result, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setFileMeta({ preview: null, name: "" });
  };

  const addMentorAssignment = (mentorId) => {
    setFormData((prev) => {
      const exists = prev.assignments.some(
        (a) => String(a.mentor_id) === String(mentorId)
      );
      if (exists) return prev;
      return {
        ...prev,
        assignments: [
          ...prev.assignments,
          {
            mentor_id: mentorId,
            role: "main_mentor",
            custom_role: "",
            responsibility: "",
          },
        ],
      };
    });
  };

  const removeMentorAssignment = (mentorId) => {
    setFormData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter(
        (a) => String(a.mentor_id) !== String(mentorId)
      ),
    }));
  };

  const updateMentorAssignment = (mentorId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => {
        if (String(a.mentor_id) === String(mentorId)) {
          return { ...a, [field]: value };
        }
        return a;
      }),
    }));
  };

  const toggleMentor = (mentorId) => {
    const exists = formData.assignments.some(
      (a) => String(a.mentor_id) === String(mentorId)
    );
    if (exists) {
      removeMentorAssignment(mentorId);
    } else {
      addMentorAssignment(mentorId);
    }
  };

  const handleSubmit = async (chosenStatus, onSubmitSuccess) => {
    setSubmitType(chosenStatus);
    setErrors({});

    const dataToValidate = {
      ...formData,
      status:
        chosenStatus === "draft" || chosenStatus === "published"
          ? chosenStatus
          : formData.status,
      registrationOpen:
        chosenStatus === "open" ? true : formData.registrationOpen,
    };

    const result = eventSchema.safeParse(dataToValidate);
    const missingCustomRole = formData.assignments.some(
      (a) => a.role === "custom" && !a.custom_role?.trim()
    );

    if (!result.success || missingCustomRole) {
      const formattedErrors = {};
      if (missingCustomRole) {
        formattedErrors.assignments = "Enter a role name for every mentor with a Custom role.";
      }
      result.error?.issues.forEach((issue) => {
        const pathKey = issue.path[0];
        if (!formattedErrors[pathKey]) {
          formattedErrors[pathKey] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setSubmitType(null);
      return;
    }

    try {
      if (onSubmitSuccess) {
        await onSubmitSuccess({
          ...result.data,
          assignments: formData.assignments,
          tenure: formData.tenure,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitType(null);
    }
  };

  return {
    formData,
    errors,
    submitType,
    fileMeta,
    handleInputChange,
    handleFileChange,
    handleRemoveFile,
    addMentorAssignment,
    removeMentorAssignment,
    updateMentorAssignment,
    toggleMentor,
    handleSubmit,
  };
}
