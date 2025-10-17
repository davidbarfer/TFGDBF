import { ActionError, defineAction, getActionContext } from "astro:actions";
import { z } from "astro:schema";
import { API_URL } from "@/utils/enviroment";

export const user = {
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
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
      if (!response.ok) {
        return new ActionError({
          code: ActionError.statusToCode(response.status),
          message: response.statusText,
        });
      }
      return response.json();
    },
  }),
  getStudentPracticeSubmission: defineAction({
    input: z.object({
      token: z.string(),
      student_id: z.string(),
      practice_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/student/${input.student_id}/practice/${input.practice_id}/submission`,
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
};
