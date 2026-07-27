import fs from 'node:fs/promises';
import path from 'node:path';
import formidable from 'formidable';
import { unhandledUserDefinedException } from '../utils/errors.mjs';
import { authenticate, query, checkSubjectStatus } from '../database.mjs';
import {
  clearTempDirectory,
  extractZip,
  getFileSubmission,
  getFileSystemBasePath,
  saveFileSubmission,
  saveFileSubmissionTemplate,
} from '../fileSystem.mjs';
import { logger } from '../logger.mjs';
import { executeMatlabFiles, extractGrade } from '../matlabFunctions.mjs';
import { add7days, parseDateMatlab } from '../utils/utils.mjs';
const FILESYSTEM_PATH = getFileSystemBasePath();
/**
 * Return a submission
 */
export const getSubmission = async (req, res, params) => {
  const submission_id = params[1];
  try {
    await authenticate(req, res, false);
    const submission = await query('SELECT * FROM submissions WHERE id = ?', [
      submission_id,
    ]);
    if (submission.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Submission not found' }));
    }
    return res.end(JSON.stringify(submission.results[0]));
  } catch (error) {
    logger.error('Database query error on getSubmission:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Return all submissions from a practice
 */
export const getPracticeSubmissions = async (req, res, params) => {
  const practice_id_submissions = params[1];
  try {
    await authenticate(req, res);
    const submissions = await query(
      'SELECT id, user_id, practice_id, file_url, delivery_date, feedback, grade, evaluator_grade FROM submissions WHERE practice_id = ?',
      [practice_id_submissions]
    );
    if (submissions.results.length === 0) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'There are no submissions for that practice' })
      );
    }
    await Promise.all(
      submissions.results.map(async (submission, idx) => {
        const user = await query(
          'SELECT id, username, name, surname FROM users WHERE id = ?',
          [submission.user_id]
        );
        submission.user = user.results[0];
        submissions.results[idx] = submission;
      })
    );
    res.statusCode = 200;
    return res.end(JSON.stringify(submissions.results));
  } catch (error) {
    logger.error('Database query error on getPracticeSubmissions:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
/**
 * Return all submissions from a group
 */
export const getGroupSubmissions = async (req, res, params) => {
  const group_id = params[1];
  try {
    await authenticate(req, res);
    const group = await query(
      'SELECT id, practice_id FROM practice_groups WHERE id = ?',
      [group_id]
    );
    const usersGroup = await query(
      'SELECT user_id FROM practice_groups_users WHERE group_id = ?',
      [group_id]
    );
    if (usersGroup.results.length === 0) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'There are no student on this group' })
      );
    }
    const usersId = usersGroup.results.map(user => user.user_id).flat();
    const usersIdQuery = usersId.map(() => '?').join(',');
    const queryParams = [...usersId, group.results[0].practice_id];
    const submissions = await query(
      `SELECT id, user_id, practice_id, file_url, delivery_date, feedback, grade, evaluator_grade FROM submissions WHERE user_id IN (${usersIdQuery}) AND practice_id = ?`,
      queryParams
    );
    if (submissions.results.length === 0) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'There are no submissions for that practice' })
      );
    }
    await Promise.all(
      submissions.results.map(async (submission, idx) => {
        const user = await query(
          'SELECT id, username, name, surname FROM users WHERE id = ?',
          [submission.user_id]
        );
        submission.user = user.results[0];
        submissions.results[idx] = submission;
      })
    );
    res.statusCode = 200;
    return res.end(JSON.stringify(submissions.results));
  } catch (error) {
    logger.error('Database query error on getGroupSubmissions:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
/**
 * Return all submssions of a student
 */
export const getStudentSubmissions = async (req, res, params) => {
  const student_id_submissions = params[1];
  try {
    await authenticate(req, res, true);
    const submissions = await query(
      'SELECT * FROM submissions WHERE user_id = ?',
      [student_id_submissions]
    );
    if (submissions.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'User submissions not found' }));
    }
    await Promise.all(
      submissions.results.map(async (submission, idx) => {
        const practice = await query(
          'SELECT name, subject_id FROM practice WHERE id = ?',
          [submission.practice_id]
        );
        submission.practice_name = practice.results[0].name;
        submission.subject_id = practice.results[0].subject_id;
        submissions.results[idx] = submission;
      })
    );
    return res.end(JSON.stringify(submissions.results));
  } catch (error) {
    logger.error('Database query error on getStudentSubmissions:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Return a submissions of a student including practice data
 */
export const getStudentSubmission = async (req, res, params) => {
  const student_id_submission_id = {
    student_id: params[1],
    submission_id: params[2],
  };
  try {
    await authenticate(req, res, true);
    const submission = await query(
      'SELECT * FROM submissions WHERE user_id = ? AND id = ?',
      [
        student_id_submission_id.student_id,
        student_id_submission_id.submission_id,
      ]
    );
    if (submission.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Submission not found' }));
    }
    const practice = await query(
      'SELECT name, subject_id FROM practice WHERE id = ?',
      [submission.results[0].practice_id]
    );
    submission.results[0].practice_name = practice.results[0].name;
    submission.results[0].subject_id = practice.results[0].subject_id;
    return res.end(JSON.stringify(submission.results[0]));
  } catch (error) {
    logger.error('Database query error on getStudentSubmission:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Return the submission file of a student
 */
export const getStudentSubmissionFile = async (req, res, params) => {
  const student_id_submission_id_file = {
    student_id: params[1],
    submission_id: params[2],
  };
  try {
    await authenticate(req, res, true);
    const practice_id = await query(
      'SELECT practice_id FROM submissions WHERE id = ? AND user_id = ?',
      [
        student_id_submission_id_file.submission_id,
        student_id_submission_id_file.student_id,
      ]
    );
    if (practice_id.results[0].length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Practice not found' }));
    }
    const practice = await query(
      'SELECT subject_id, submissions_template_url FROM practice WHERE id = ?',
      [practice_id.results[0].practice_id]
    );
    if (practice.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Subject not found' }));
    }
    const url = practice.results[0].submissions_template_url;
    const submissionFile = await getFileSubmission(
      url,
      student_id_submission_id_file
    );
    if (!submissionFile) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Submission file not found' }));
    }
    return res.end(JSON.stringify(submissionFile));
  } catch (error) {
    logger.error('Database query error on getStudentSubmissionFile:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
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
        await checkSubjectStatus(data.url_params.subject_id);
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
        logger.error('Database query error on postStudentSubmissionFile:', {
          error: error.message,
          stack: error.stack,
        });
        res.statusCode = error.statusCode || 500;
        return res.end(
          JSON.stringify({
            error: error.statusCode ? error.message : 'Internal server error',
          })
        );
      }
    });
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Crea todas las entregas de los alumnos perteniencientes a un grupo
 */
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
        const practiceCheck = await query(
          'SELECT subject_id FROM practice WHERE id = ?',
          [group.results[0].practice_id]
        );
        if (practiceCheck.results.length > 0) {
          await checkSubjectStatus(practiceCheck.results[0].subject_id);
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
        logger.error('Database query error on postPracticeGroupSubmissions:', {
          error: error.message,
          stack: error.stack,
        });
        if (error.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: error.sqlMessage }));
        }
        res.statusCode = error.statusCode || 500;
        return res.end(
          JSON.stringify({
            error: error.statusCode ? error.message : 'Internal server error',
          })
        );
      }
    });
  } catch (error) {
    logger.error('Database query error on postPracticeGroupSubmissions:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Edita una entrega
 */
export const postPracticeSubmissionEdit = async (req, res, params) => {
  const practice_id_submission_id_edit = {
    practice_id: params[1],
    submission_id: params[2],
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
        logger.error('Database query error on postPracticeSubmissionEdit:', {
          error: error.message,
          stack: error.stack,
        });
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch (error) {
    logger.error('Database query error on postPracticeSubmissionEdit:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Crea el evaluador de una práctica
 */
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
        await checkSubjectStatus(subject_id);
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
        } catch (error) {
          logger.error('Error renaming file on postPracticeEvaluatorCreate:', {
            error: error.message,
            stack: error.stack,
          });
          // Fallback: if rename fails, we still have the temp file
        }
        try {
          const fileUrlResponse = await query(
            'UPDATE practice SET evaluator_template_url = ? WHERE id = ?',
            [newPath, practiceId]
          );
          if (fileUrlResponse.results.affectedRows === 0) {
            logger.error(
              'No rows were updated in the database on postPracticeEvaluatorCreate.'
            );
            res.statusCode = 500;
            return res.end(
              JSON.stringify({
                error: 'Internal Server Error on saving submission template',
              })
            );
          }
        } catch (error) {
          logger.error('Database query error on postPracticeEvaluatorCreate:', {
            error: error.message,
            stack: error.stack,
          });
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
            logger.info('Submission template file saved succesfully');
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
      logger.error('Database query error on postPracticeEvaluatorCreate:', {
        error: error.message,
        stack: error.stack,
      });
      res.statusCode = error.statusCode || 500;
      return res.end(
        JSON.stringify({
          error: error.statusCode ? error.message : 'Internal server error',
        })
      );
    }
  } catch (error) {
    logger.error('Database query error on postPracticeEvaluatorCreate:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Ejecuta la entrega de un alumno en base al evaluador
 */
export const postStudentSubmissionEvaluate = async (req, res, params) => {
  const student_id_submission_id_evaluate = {
    student_id: params[1],
    submission_id: params[2],
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
          logger.error(
            'Error deleteing temp files on postStudentSubmissionEvaluate'
          );
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
        logger.error('Database query error on postStudentSubmissionEvaluate:', {
          error: error.message,
          stack: error.stack,
        });
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Crea todas las entregas de una practica (todos los alumnos que pertencen a todos los grupos)
 */
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
        logger.error('Database query error on postPracticeSubmissions:', {
          error: error.message,
          stack: error.stack,
        });
        if (error.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: error.sqlMessage }));
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
/**
 * Califica la entega de un alumno en base a la nota del evaluador
 */
export const putStudentSubmissionGrade = async (req, res, params) => {
  const student_id_submission_id_grade = {
    student_id: params[1],
    submission_id: params[2],
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
        if (!data.submission_id || !data.evaluator_grade || !data.user_id) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Submission ID or evaluator grade or user ID is missing',
            })
          );
        }
        if (
          Number(data.submission_id) !==
          Number(student_id_submission_id_grade.submission_id)
        ) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        const subCheck = await query(
          'SELECT p.subject_id FROM submissions s JOIN practice p ON s.practice_id = p.id WHERE s.id = ?',
          [data.submission_id]
        );
        if (subCheck.results.length > 0) {
          await checkSubjectStatus(subCheck.results[0].subject_id);
        }
        const result = await query(
          'UPDATE submissions set grade = ? WHERE id = ? AND user_id = ?',
          [data.evaluator_grade, data.submission_id, data.user_id]
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
        logger.error('Database query error on putStudentSubmissionGrade:', {
          error: error.message,
          stack: error.stack,
        });
        res.statusCode = error.statusCode || 500;
        return res.end(
          JSON.stringify({
            error: error.statusCode ? error.message : 'Internal server error',
          })
        );
      }
    });
  } catch (error) {
    logger.error('Database query error on putStudentSubmissionGrade:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
