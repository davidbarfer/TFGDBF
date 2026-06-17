import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { API_URL } from "@/utils/enviroment";
import { handleActionError } from "@/utils/handler";

export const user = {
  getCurrentUser: defineAction({
    input: z.object({
      token: z.string(),
    }),
    handler:async (input) => {
      const response = await fetch(`${API_URL}/users/current`, {
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getSubject: defineAction({
    input: z.object({
      id: z.string(),
      token: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/subject/${input.id}`, {
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getSubjects: defineAction({
    input: z.object({
      token: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/subjects`, {
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getSubjectsUser: defineAction({
    input: z.object({
      token: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/subjects/user`, {
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getPractices: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/subject/${input.subject_id}/practices`,
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
  getPractice: defineAction({
    input: z.object({
      token: z.string(),
      practice_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/practice/${input.practice_id}`, {
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getGroups: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
      practice_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/subject/${input.subject_id}/practice/${input.practice_id}/groups`,
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
  getStudentGroups: defineAction({
    input: z.object({
      token: z.string(),
      user_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/student/${input.user_id}/groups`,
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (response.status === 404) {
        return [];
      }
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  addStudentToGroup: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
      student_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/group/${input.group_id}/student/${input.student_id}`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
          },
          body: JSON.stringify({
            group_id: input.group_id,
            student_id: input.student_id,
          }),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getGroup: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/group/${input.group_id}`, {
        headers: {
          Authorization: input.token,
        },
      });
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getGroupStudents: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/group/${input.group_id}/students`,
        {
          headers: {
            Authorization: input.token,
          },
        }
      );
      if(response.status === 404) {
        return [];
      }
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getStudentSubmissions: defineAction({
    input: z.object({
      token: z.string(),
      user_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/student/${input.user_id}/submissions`,
        {
          method: "GET",
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getStudentSubmission: defineAction({
    input: z.object({
      token: z.string(),
      student_id: z.string(),
      submission_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/student/${input.student_id}/submission/${input.submission_id}`,
        {
          method: "GET",
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    },
  }),
  getSubmissionFile: defineAction({
    input: z.object({
      token: z.string(),
      student_id: z.string(),
      submission_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/student/${input.student_id}/submission/${input.submission_id}/file`,
        {
          method: "GET",
          headers: {
            Authorization: input.token,
          },
        }
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
  }),
  saveSubmissionFile: defineAction({
    input: z.object({
      token: z.string(),
      url_params: z.object({
        creation_date: z.string(),
        user_id: z.string(),
        subject_id: z.string(),
        practice_id: z.string(),
        submission_id: z.string(),
      }),
      file_content: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/student/${input.url_params.user_id}/submission/${input.url_params.submission_id}/file`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
          },
          body: JSON.stringify({
            file_content: input.file_content,
            url_params: input.url_params
          }),
        }
      );
      if (!response.ok) await handleActionError(response);
      return response.json();
    }
  }),
};
