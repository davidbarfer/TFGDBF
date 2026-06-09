import formidable from 'formidable';
import fs from 'node:fs/promises';
import path from 'node:path';
import { authenticate } from '../database.mjs';
import { query, unhandledUserDefinedException } from '../database.mjs';
import { parseDateMatlab, add7days } from '../utils.mjs';
import {
  saveFileSubmission,
  saveFileSubmissionTemplate,
  getFileSystemBasePath,
  extractZip,
  clearTempDirectory,
} from '../fileSystem.mjs';
import { executeMatlabFiles, extractGrade } from '../matlabFunctions.mjs';
const FILESYSTEM_PATH = getFileSystemBasePath();
export const postStudentSubmissionFile = async (req, res, params) => {
  try {
    await authenticate(req, res, true);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.file_content) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'File content is required',
            })
          );
        }
        if (data.file_content.length > 1000000) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'File size exceeds the limit of 1MB',
            })
          );
        }
        if (!data.url_params) {
          res.statusCode = 500;
          return res.end(
            JSON.stringify({
              error: 'File URL constructor error',
            })
          );
        }
        data.url_params.creation_date = parseDateMatlab(
          data.url_params.creation_date
        );
        const file_Name = `U${data.url_params.user_id}_S${data.url_params.subject_id}_P${data.url_params.practice_id}_ID${data.url_params.submission_id}_${data.url_params.creation_date}.m`;
        const url = `${data.url_params.subject_id}/${data.url_params.practice_id}/submissions/${file_Name}`;
        const saveResult = await saveFileSubmission(
          url,
          data.file_content,
          data.url_params.submission_id
        );
        switch (saveResult) {
          case 500: {
            res.statusCode = 500;
            return res.end(
              JSON.stringify({
                error: 'Internal Server Error on saving submission',
              })
            );
          }
          case 400: {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                error: 'Error executing submission file. Syntax Error',
              })
            );
          }
          case 201: {
            res.statusCode = 201;
            return res.end(
              JSON.stringify({ message: 'Submission saved successfully' })
            );
          }
        }
      } catch (error) {
        console.error('Database query error on submit file:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postPracticeCreate = async (req, res, params) => {
  const subject_id_practices = params[0].split('/')[2];
  try {
    await authenticate(req, res);
    let body = '';

    // Collect request data
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        // Parse and validate request body
        const data = JSON.parse(body);
        // Simple validation
        if (!data.name || !data.description) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({ error: 'Name and description are required' })
          );
        }
        const practice = await query(
          'INSERT INTO practice (subject_id, name, description, deadline) VALUES (?, ?, ?, ?)',
          [subject_id_practices, data.name, data.description, data.deadline]
        );
        return res.end(JSON.stringify(practice.results));
      } catch (error) {
        console.error('Database query error on create practice:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch (error) {
    console.error('Error checking subject ID:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postPracticeGroupsCreate = async (req, res, params) => {
  try {
    await authenticate(req, res);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (
          !data.group_name ||
          !data.max_participants ||
          !data.group_date ||
          !data.start_time ||
          !data.end_time
        ) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error:
                'Group name, max participants, group date, start time and end time are required',
            })
          );
        }
        const group = await query(
          'INSERT INTO practice_groups (practice_id, name, max_participants, practice_group_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
          [
            data.practice_id,
            data.group_name,
            data.max_participants,
            data.group_date,
            data.start_time,
            data.end_time,
          ]
        );
        res.statusCode = 201;
        return res.end(JSON.stringify(group.results));
      } catch (err) {
        console.error('Database query error on create group:', err);
        if (err.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: err.sqlMessage }));
        }
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postGroupStudent = async (req, res, params) => {
  try {
    await authenticate(req, res, true);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.group_id || !data.student_id) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Group ID and student ID are required',
            })
          );
        }
        const result = await query(
          'INSERT INTO practice_groups_users (group_id, user_id) VALUES (?, ?)',
          [data.group_id, data.student_id]
        );
        res.statusCode = 201;
        return res.end(JSON.stringify(result.results));
      } catch (error) {
        console.error('Database query error on create group:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postPracticeGroupSubmissions = async (req, res, params) => {
  try {
    await authenticate(req, res);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.practice_id || !data.group_id) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Practice ID and group ID are required',
            })
          );
        }
        const group = await query(
          'SELECT id, practice_id, practice_group_date FROM practice_groups WHERE id = ?',
          [data.group_id]
        );
        if (group.results.length === 0) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Group not found',
            })
          );
        }
        if (Number(group.results[0].practice_id) !== Number(data.practice_id)) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Group does not belong to the practice',
            })
          );
        }
        const user_ids = await query(
          'SELECT user_id FROM practice_groups_users WHERE group_id = ?',
          [data.group_id]
        );
        if (user_ids.results.length === 0) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'No students have been assigned to the group',
            })
          );
        }
        const submissionsData = user_ids.results.map(user_id => ({
          user_id: user_id.user_id,
          practice_id: data.practice_id,
          delivery_date: add7days(group.results[0].practice_group_date),
          feedback: '',
          grade: null,
          evaluator_grade: null,
        }));
        const result = [];
        await Promise.all(
          submissionsData.map(async (submission, idx) => {
            const resultSubmission = await query(
              'INSERT INTO submissions (user_id, practice_id, delivery_date, feedback, grade, evaluator_grade) VALUES (?, ?, ?, ?, ?, ?)',
              [
                submission.user_id,
                submission.practice_id,
                submission.delivery_date,
                submission.feedback,
                submission.grade,
                submission.evaluator_grade,
              ]
            );
            if (resultSubmission.results.affectedRows === 0) {
              res.statusCode = 400;
              return res.end(
                JSON.stringify({
                  error: `No submissions were created for user ${submissionsData[idx].user_id}`,
                })
              );
            }
            result[idx] = resultSubmission.results;
          })
        );
        res.statusCode = 201;
        return res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Database query error on create submissions:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch (error) {
    console.error('Database query error on get submissions:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postPracticeSubmissionEdit = async (req, res, params) => {
  const practice_id_submission_id_edit = {
    practice_id: params[0].split('/')[2],
    submission_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Data required missing' }));
        }
        const isSubmission = await query(
          'SELECT id FROM submissions WHERE id = ? AND practice_id = ?',
          [
            practice_id_submission_id_edit.submission_id,
            practice_id_submission_id_edit.practice_id,
          ]
        );

        if (isSubmission.results.length === 0) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Submission NOT FOUND' }));
        }

        const result = await query(
          'UPDATE submissions SET delivery_date = ?, evaluator_grade = ?, grade = ?, feedback = ? WHERE id = ? AND practice_id = ?',
          [
            data.delivery_date,
            data.evaluator_grade,
            data.grade,
            data.feedback,
            practice_id_submission_id_edit.submission_id,
            practice_id_submission_id_edit.practice_id,
          ]
        );
        if (result.results.affectedRows === 0) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'No submissions affected' }));
        }
        res.statusCode = 204;
        return res.end(
          JSON.stringify({ message: 'Submission updated successfully' })
        );
      } catch (error) {
        console.error('Database query error on edit submissions:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch (error) {
    console.error('Database query error on edit the submission', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postPracticeEvaluatorCreate = async (req, res, params) => {
  try {
    await authenticate(req, res);
    try {
      const uploadSubmisisonDir = `${FILESYSTEM_PATH}/temp`;

      const form = formidable({
        uploadDir: uploadSubmisisonDir,
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
      });
      const [fields, files] = await form.parse(req);
      // 1. Extract data (Note: Formidable v3 uses arrays for fields)
      const practiceId = fields.practice_id?.[0] || 'unknown';
      const submissionTemplate = fields.studentTemplate;
      const uploadedFile = files.evaluatorFiles?.[0]; // This is the file object
      if (uploadedFile) {
        const result = await query(
          'SELECT subject_id FROM practice where id = ?',
          [practiceId]
        );
        if (result.results.length === 0) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        const subject_id = result.results[0].subject_id;
        // 2. Define your new name
        // Example: "practice_123_evaluator.zip"
        const newFileName = `evaluator_S${subject_id}_P${practiceId}${path.extname(uploadedFile.originalFilename || '.zip')}`;
        const newPath = `${subject_id}/${practiceId}/evaluator/${newFileName}`;

        try {
          // 3. Rename/Move the file from the temp name to your specific name
          await fs.rename(
            uploadedFile.filepath,
            `${FILESYSTEM_PATH}/${newPath}`
          );
        } catch (renameError) {
          console.error('Error renaming file:', renameError);
          // Fallback: if rename fails, we still have the temp file
        }
        try {
          const fileUrlResponse = await query(
            'UPDATE practice SET evaluator_template_url = ? WHERE id = ?',
            [newPath, practiceId]
          );
          if (fileUrlResponse.results.affectedRows === 0) {
            console.error('No rows were updated in the database.');
            res.statusCode = 500;
            return res.end(
              JSON.stringify({
                error: 'Internal Server Error on saving submission template',
              })
            );
          }
        } catch (error) {
          console.error('Error updating database:', error);
          res.statusCode = 500;
          return res.end(
            JSON.stringify({
              error: 'Internal Server Error on saving submission template',
            })
          );
        }
        const submissionTemplatePath = `${subject_id}/${practiceId}/submissions/template.m`;
        const saveResult = await saveFileSubmissionTemplate(
          submissionTemplatePath,
          submissionTemplate,
          practiceId
        );
        switch (saveResult) {
          case 500: {
            res.statusCode = 500;
            return res.end(
              JSON.stringify({
                error: 'Internal Server Error on saving submission template',
              })
            );
          }
          case 400: {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                error: 'Error executing submission template file. Syntax Error',
              })
            );
          }
          case 201: {
            console.log('Submission template file saved succesfully');
          }
        }
      }
      // 4. Send response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          fileName: uploadedFile?.originalFilename,
        })
      );
    } catch (error) {
      console.error('Database query error on edit submissions:', error);
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } catch (error) {
    console.error('Database query error on edit the submission', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postStudentSubmissionEvaluate = async (req, res, params) => {
  const student_id_submission_id_evaluate = {
    student_id: params[0].split('/')[2],
    submission_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res, false);
    req.on('data', async () => {});
    req.on('end', async () => {
      try {
        // Descomprimir el archivo
        const submision = await query(
          'SELECT id, user_id, practice_id, file_url from submissions WHERE id = ?',
          [student_id_submission_id_evaluate.submission_id]
        );
        if (submision.results[0].file_url === null) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({ error: 'Submission file was not found' })
          );
        }
        const evaluator_template_url = await query(
          'SELECT evaluator_template_url from practice WHERE id = ?',
          [submision.results[0].practice_id]
        );
        const zipFilePath = `${FILESYSTEM_PATH}/${evaluator_template_url.results[0].evaluator_template_url}`;
        const outputPath = `${FILESYSTEM_PATH}/temp`;
        try {
          await extractZip(zipFilePath, outputPath);
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err }));
        }
        // Ejecutar el evaulador
        const evaluadorFiles = [
          `${FILESYSTEM_PATH}/${submision.results[0].file_url}`,
          `${outputPath}/evaluador.m`,
        ];
        let resultExecuteFiles;
        try {
          resultExecuteFiles = await executeMatlabFiles(evaluadorFiles);
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err }));
        }
        const grade = extractGrade(resultExecuteFiles);
        // Actualizar la base de datos
        const updateDbResult = await query(
          'UPDATE submissions set evaluator_grade = ?, evaluator_result = ? WHERE id = ?',
          [grade, resultExecuteFiles, submision.results[0].id]
        );
        if (updateDbResult.results.affectedRows === 0) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'No submissions affected' }));
        }
        // Eliminar los archivos descomprimidos
        const DeleteTempFiles = await clearTempDirectory(outputPath);
        if (!DeleteTempFiles) {
          console.log('Error deleteing temp files');
        }
        // Send response
        res.statusCode = 204;
        return res.end(
          JSON.stringify({
            success: true,
            message: 'Submission updated successfully',
          })
        );
      } catch (error) {
        console.error('Database query error on executing evaluator:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postPracticeSubmissions = async (req, res, params) => {
  try {
    await authenticate(req, res);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.practice_id) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Practice ID is required',
            })
          );
        }
        const practice_groups = await query(
          'SELECT id, practice_group_date FROM practice_groups WHERE practice_id = ?',
          [data.practice_id]
        );
        if (practice_groups.results.length === 0) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Practice does not have any groups',
            })
          );
        }
        const user_ids = await query(
          'SELECT user_id FROM practice_groups_users WHERE group_id IN (?)',
          [practice_groups.results.map(group => group.id).flat()]
        );
        if (user_ids.results.length === 0) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'No students have been assigned to the practice',
            })
          );
        }
        const submissionsData = user_ids.results.map(user_id => ({
          user_id: user_id.user_id,
          practice_id: data.practice_id,
          delivery_date: add7days(
            practice_groups.results[0].practice_group_date
          ),
          feedback: '',
          grade: null,
          evaluator_grade: null,
        }));
        const result = [];
        await Promise.all(
          submissionsData.map(async (submission, idx) => {
            const resultSubmission = await query(
              'INSERT INTO submissions (user_id, practice_id, delivery_date, feedback, grade, evaluator_grade) VALUES (?, ?, ?, ?, ?, ?)',
              [
                submission.user_id,
                submission.practice_id,
                submission.delivery_date,
                submission.feedback,
                submission.grade,
                submission.evaluator_grade,
              ]
            );
            if (resultSubmission.results.affectedRows === 0) {
              res.statusCode = 400;
              return res.end(
                JSON.stringify({
                  error: `No submissions were created for user ${submissionsData[idx].user_id}`,
                })
              );
            }
            result[idx] = resultSubmission.results;
          })
        );
        res.statusCode = 201;
        return res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Database query error on create submissions:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const postSubjectCreate = async (req, res, params) => {
  await authenticate(req, res);
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      if (!data.name || !data.course || !data.degree) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: 'Name, course and degree are required.' })
        );
      }
      try {
        const subject = await query(
          'INSERT INTO subject (name, course, degree_id) VALUES (?, ?, ?)',
          [data.name, data.course, data.degree]
        );
        res.statusCode = 201;
        return res.end(JSON.stringify(subject.results));
      } catch (err) {
        console.error('Database query error on create subject:', err);
        if (err.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: err.sqlMessage }));
        }
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    } catch {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
};
