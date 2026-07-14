import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { API_URL } from "@/utils/enviroment";
import { handleActionError } from "@/utils/handler";

export const professor = {
  getSubjectsStudents: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/subjects/${input.subject_id}/users`,
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getUsersProfessors: defineAction({
    input: z.object({token: z.string()}),
    handler: async(input) => {
      const response = await fetch(`${API_URL}/users/professor`, 
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getUsersStudents: defineAction({
    input: z.object({token: z.string()}),
    handler: async(input) => {
      const response = await fetch(`${API_URL}/users/student`, 
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  deleteStudentGroup: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
      student_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/groups/${input.group_id}/users/${input.student_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  deleteGroup: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/groups/${input.group_id}`, {
        method: "DELETE",
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  deleteSubject: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/subjects/${input.subject_id}`, {
        method: "DELETE",
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  createPractice: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
      practice_data: z.object({
        name: z.string(),
        description: z.string(),
        deadline: z.string(),
      }),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/subjects/${input.subject_id}/create`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input.practice_data),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  createGroups: defineAction({
    input: z.object({
      token: z.string(),
      practice_id: z.string(),
      groups: z.array(
        z.object({
          group_name: z.string(),
          max_participants: z.number(),
          group_date: z.string(),
          start_time: z.string(),
          end_time: z.string(),
        })
      ),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/groups/create`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            practice_id: input.practice_id,
            groups: input.groups
          }),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getPracticeSubmissions: defineAction({
    input: z.object({
      token: z.string(),
      practice_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/practices/${input.practice_id}/submissions`,
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (response.status === 404) return [];
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getGroupSubmissions: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/groups/${input.group_id}/submissions`,
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (response.status === 404) return [];
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getSubmission: defineAction({
    input: z.object({
      token: z.string(),
      submission_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/submissions/${input.submission_id}`,
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  createSubmissions: defineAction({
    input: z.object({
      token: z.string(),
      practice_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/practices/${input.practice_id}/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ practice_id: input.practice_id }),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  createSubmissionsGroup: defineAction({
    input: z.object({
      token: z.string(),
      url_data: z.object({
        practice_id: z.string(),
        group_id: z.string(),
      }),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/practices/${input.url_data.practice_id}/groups/${input.url_data.group_id}/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input.url_data),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  gradeSubmissionStudent: defineAction({
    input: z.object({
      token: z.string(),
      url_data: z.object({
        submission_id: z.string(),
        user_id: z.string(),
        evaluator_grade: z.string({message: 'Nota del evaluador requerida'}),
      }),
    }),
    handler: async(input) => {
      const response = await fetch(        
        `${API_URL}/users/${input.url_data.user_id}/submissions/${input.url_data.submission_id}/grade`,
        {
          method: "PUT",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input.url_data),
        }
      );
      if (!response.ok) await handleActionError(response);
      return true;
    },
  }),
  editSubmissionStudent: defineAction({
    input: z.object({
      token: z.string(),
      url_data: z.object({
        practice_id: z.string(),
        submission_id: z.string(),
      }),
      submissionData: z.object({
        delivery_date: z.string(),
        evaluator_grade: z.string().nullable(),
        grade: z.string().nullable(),
        feedback: z.string(), 
      })
    }),
    handler: async(input) => {
      const response = await fetch(        
        `${API_URL}/practices/${input.url_data.practice_id}/submissions/${input.url_data.submission_id}/edit`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input.submissionData),
        }
      );
      if (!response.ok) await handleActionError(response);
      return true;
    },
  }),
  createEvaulatorPractice: defineAction({
    accept: "form", // ← Key change: accept form data instead of json
    input: z.object({
      token: z.string(),
      practice_id: z.string(),
      studentTemplate: z.string(),
      evaluatorFiles: z
        .instanceof(File)
        .refine((file) => file.size > 0, "File is required")
        .refine(
          (file) => file.size <= 50_000_000, // 50MB max
          "Max file size is 50MB"
        )
        .refine(
          (file) => file.type === "application/zip" || file.name.endsWith('.zip'),
          "Only .zip files are allowed"
        ),
    }),
    handler: async(input) => {
    // Convert File to Buffer or FormData for your backend
      const buffer = await input.evaluatorFiles.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);
      
      // Option 1: Send as multipart/form-data to backend
      const formData = new FormData();
      formData.append('studentTemplate', input.studentTemplate);
      formData.append('evaluatorFiles', input.evaluatorFiles);
      formData.append('practice_id', input.practice_id);
      const response = await fetch(
        `${API_URL}/practices/${input.practice_id}/evaluator/create`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
          },
          body: formData,
        }
      );
      if (!response.ok) await handleActionError(response);
      return true;
    },
  }),
  executeSubmssionEvaluator: defineAction({
    input: z.object({
      token: z.string(),
      url_data: z.object({
        user_id: z.string(),
        submission_id: z.string(),
      }),
    }),
    handler: async(input) => {
      const response = await fetch(        
        `${API_URL}/users/${input.url_data.user_id}/submissions/${input.url_data.submission_id}/evaluate`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return true;
    },
  }),
  createSubject: defineAction({
    input: z.object({
      token: z.string(),
      subject: z.object({
        name: z.string(),
        course: z.number(),
        degree: z.string(),
      })
    }),
    handler: async(input) => {
      const response = await fetch(
        `${API_URL}/subjects/create`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
          },
          body: JSON.stringify(input.subject),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json()
    },
  }),
  assignUserSubject: defineAction({
    input: z.object({
      token: z.string(),
      user_id: z.number(),
      subject_id: z.number(),
    }),
    handler: async(input) => {
      const response = await fetch(
        `${API_URL}/users/${input.user_id}/subjects/${input.subject_id}`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
          },
          body: null,
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json()
    }
  }),
  updateGroup: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.number(),
      group: z.object({
        name: z.string(),
        max_participants: z.string(),
        group_date: z.string(),
        start_time: z.string(),
        end_time: z.string(),
      }),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/groups/${input.group_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: input.token,
          },
          body: JSON.stringify(input.group),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json()
    }
  }),
  updateUserStatus: defineAction({
    input: z.object({
      token: z.string(),
      user: z.object({
        id: z.string(),
        status: z.boolean(),
      }),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/users/${input.user.id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: input.token,
          },
          body: JSON.stringify(input.user),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json()
    }
  }),
  downloadPracticeGrades: defineAction({
    input: z.object({
      token: z.string(),
      practice_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/practices/${input.practice_id}/export`,
        {
          method: "GET",
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.text()
    }
  }),
  downloadSubjectGrades: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/subjects/${input.subject_id}/export`,
        {
          method: "GET",
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.text()
    }
  }),
  downloadGroupStudents: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/groups/${input.group_id}/export`,
        {
          method: "GET",
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.text()
    }
  }),
};
