import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { API_URL } from "@/utils/enviroment";

export const professor = {
  getSubjectsStudents: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/subject/${input.subject_id}/students`,
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
  deleteStudentGroup: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
      student_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/group/${input.group_id}/student/${input.student_id}`,
        {
          method: "DELETE",
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
  deleteGroup: defineAction({
    input: z.object({
      token: z.string(),
      group_id: z.string(),
    }),
    handler: async (input) => {
      const response = await fetch(`${API_URL}/group/${input.group_id}`, {
        method: "DELETE",
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
        `${API_URL}/subject/${input.subject_id}/create`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input.practice_data),
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
  createGroups: defineAction({
    input: z.object({
      token: z.string(),
      subject_id: z.string(),
      group_data: z.object({
        practice_id: z.string(),
        group_name: z.string(),
        max_participants: z.number(),
        group_date: z.string(),
        start_time: z.string(),
        end_time: z.string(),
      }),
    }),
    handler: async (input) => {
      const response = await fetch(
        `${API_URL}/subject/${input.subject_id}/practice/${input.group_data.practice_id}/groups/create`,
        {
          method: "POST",
          headers: {
            Authorization: input.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input.group_data),
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
};
