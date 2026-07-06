import { authenticate, query } from '../database.mjs';
import { logger } from '../logger.mjs';
import * as fastcsv from 'fast-csv';

export const exportPracticeGrades = async (req, res, params) => {
  const practice_id = params[0].split('/')[2];
  try {
    await authenticate(req, res);
    logger.info('Profesor solicitó exportación de notas con fast-csv', {
      practice_id,
    });

    const sql = `
    SELECT 
      u.id AS student_id,
      u.username AS student_username,
      u.name AS student_name,
      u.surname AS student_surname,
      s.grade AS grade,
      s.delivery_date AS graded_at
    FROM users u
    LEFT JOIN submissions s ON s.user_id = u.id AND s.practice_id = ?
    WHERE u.id IN (
      SELECT pgu.user_id 
      FROM practice_groups_users pgu
      JOIN practice_groups pg ON pgu.group_id = pg.id
      WHERE pg.practice_id = ?
    )`;

    const dbResult = await query(sql, [practice_id, practice_id]);
    const rows = dbResult.results;
    if (!rows || rows.length === 0) {
      logger.warn('Exportación vacía: No se encontraron alumnos o notas', {
        practice_id,
      });
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'No data found for this practice' })
      );
    }

    // 3. Configurar cabeceras de respuesta HTTP para forzar la descarga de un archivo binario
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=practica_${practice_id}_notas.csv`,
      Pragma: 'no-cache',
      Expires: '0',
    });

    // 4. Configurar el formateador de fast-csv
    // headers: true escribe la fila de cabecera automáticamente basándose en las llaves del objeto entregado en .write()
    // BOM: true añade el Byte Order Mark para que Excel en Windows autodetecte los acentos perfectamente
    const csvStream = fastcsv.format({
      headers: true,
      BOM: true,
    });

    // 5. Conectar (pipe) el flujo del CSV directamente a la respuesta HTTP de Node
    csvStream.pipe(res);

    // 6. Escribir los registros mapeados fila por fila en el stream
    rows.forEach(row => {
      csvStream.write({
        ID_Alumno: row.student_id,
        DNI: row.student_username,
        Nombre: row.student_name,
        Apellido: row.student_surname,
        Nota: row.grade !== null ? row.grade : 'Sin evaluar',
        Fecha_Limite_Entrega: row.graded_at || 'N/A',
      });
    });

    // 7. Finalizar el stream para indicar a HTTP que el envío ha terminado
    csvStream.end();
    logger.info('Archivo CSV transmitido con éxito vía Streams', {
      practice_id,
      total_rows: rows.length,
    });
  } catch (error) {
    logger.error('Error al exportar notas de práctica con fast-csv', {
      practice_id,
      error: error.message,
      stack: error.stack,
    });

    // Si las cabeceras HTTP ya se enviaron, no podemos responder con JSON de error, cerramos la conexión abruptamente
    if (!res.headersSent) {
      res.statusCode = 500;
      return res.end(
        JSON.stringify({ error: 'Internal server error during export' })
      );
    }
    res.end();
  }
};
export const exportSubjectGrades = async (req, res, params) => {
  const subject_id = params[0].split('/')[2];
  try {
    await authenticate(req, res);
    logger.info('Profesor solicitó exportación de notas con fast-csv', {
      subject_id,
    });

    const practicesSql = `SELECT id, name FROM practice WHERE subject_id = ? ORDER BY id`;
    const dbPractices = await query(practicesSql, [subject_id]);
    const practices = dbPractices.results || [];

    if (practices.length === 0) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'No practices found for this subject' })
      );
    }

    // 2. Construir los fragmentos condicionales dinámicos para cada práctica
    // Esto creará fragmentos como: MAX(CASE WHEN s.practice_id = 5 THEN s.grade END) AS `Nota - Practica 1`
    const dynamicColumns = practices
      .map(p => {
        return `MAX(CASE WHEN s.practice_id = ${p.id} THEN s.grade END) AS \`p_${p.id}\``;
      })
      .join(',\n        ');

    // 3. Consulta SQL Principal Pivotada
    const sql = `
      SELECT 
        u.id AS student_id,
        u.username AS student_username,
        u.name AS student_name,
        u.surname AS student_surname,
        ${dynamicColumns}
      FROM users u
      JOIN users_subjects us ON us.user_id = u.id AND us.subject_id = ?
      LEFT JOIN submissions s ON s.user_id = u.id
      GROUP BY u.id, u.username, u.name, u.surname
    `;
    const dbResult = await query(sql, [subject_id]);
    const rows = dbResult.results;
    if (!rows || rows.length === 0) {
      logger.warn('Exportación vacía: No se encontraron alumnos o notas', {
        subject_id,
      });
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'No data found for this subkect' })
      );
    }

    // 3. Configurar cabeceras de respuesta HTTP para forzar la descarga de un archivo binario
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=asignatura_${subject_id}_notas.csv`,
      Pragma: 'no-cache',
      Expires: '0',
    });

    // 4. Configurar el formateador de fast-csv
    // headers: true escribe la fila de cabecera automáticamente basándose en las llaves del objeto entregado en .write()
    // BOM: true añade el Byte Order Mark para que Excel en Windows autodetecte los acentos perfectamente
    const csvStream = fastcsv.format({
      headers: true,
      BOM: true,
    });

    // 5. Conectar (pipe) el flujo del CSV directamente a la respuesta HTTP de Node
    csvStream.pipe(res);

    // 6. Escribir los registros mapeados fila por fila en el stream
    rows.forEach(row => {
      const csvRow = {
        ID_Alumno: row.student_id,
        DNI: row.student_username,
        Nombre: row.student_name,
        Apellidos: row.student_surname,
      };

      // Adjuntar de manera dinámica el nombre de la práctica real y su respectiva nota
      practices.forEach(p => {
        const gradeValue = row[`p_${p.id}`];
        csvRow[`Nota: ${p.name}`] =
          gradeValue !== null ? gradeValue : 'Sin evaluar';
      });

      csvStream.write(csvRow);
    });

    // 7. Finalizar el stream para indicar a HTTP que el envío ha terminado
    csvStream.end();
    logger.info('Archivo CSV transmitido con éxito vía Streams', {
      subject_id,
      total_rows: rows.length,
    });
  } catch (error) {
    logger.error('Error al exportar notas de la asignatura', {
      subject_id,
      error: error.message,
      stack: error.stack,
    });

    // Si las cabeceras HTTP ya se enviaron, no podemos responder con JSON de error, cerramos la conexión abruptamente
    if (!res.headersSent) {
      res.statusCode = 500;
      return res.end(
        JSON.stringify({ error: 'Internal server error during export' })
      );
    }
    res.end();
  }
};
export const exportGroupStudents = async (req, res, params) => {
  const group_id = params[0].split('/')[2];
  try {
    await authenticate(req, res);
    logger.info('Profesor solicitó exportación de alumnos con fast-csv', {
      group_id,
    });
    const sql = `
    SELECT 
      u.id AS student_id,
      u.username AS student_username,
      u.name AS student_name,
      u.surname AS student_surname
    FROM users u
    JOIN practice_groups_users pgu ON pgu.user_id = u.id
    WHERE pgu.group_id = ?
    `;
    const dbResult = await query(sql, [group_id]);
    const rows = dbResult.results;
    if (!rows || rows.length === 0) {
      logger.warn('Exportación vacía: No se encontraron alumnos', {
        group_id,
      });
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'No data found for this subkect' })
      );
    }

    // 3. Configurar cabeceras de respuesta HTTP para forzar la descarga de un archivo binario
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=grupo_${group_id}_alumnos.csv`,
      Pragma: 'no-cache',
      Expires: '0',
    });

    // 4. Configurar el formateador de fast-csv
    // headers: true escribe la fila de cabecera automáticamente basándose en las llaves del objeto entregado en .write()
    // BOM: true añade el Byte Order Mark para que Excel en Windows autodetecte los acentos perfectamente
    const csvStream = fastcsv.format({
      headers: true,
      BOM: true,
    });

    // 5. Conectar (pipe) el flujo del CSV directamente a la respuesta HTTP de Node
    csvStream.pipe(res);

    // 6. Escribir los registros mapeados fila por fila en el stream
    rows.forEach(row => {
      const csvRow = {
        ID_Alumno: row.student_id,
        DNI: row.student_username,
        Nombre: row.student_name,
        Apellidos: row.student_surname,
      };

      csvStream.write(csvRow);
    });

    // 7. Finalizar el stream para indicar a HTTP que el envío ha terminado
    csvStream.end();
    logger.info('Archivo CSV transmitido con éxito vía Streams', {
      group_id,
      total_rows: rows.length,
    });
  } catch (error) {
    logger.error('Error al exportar grupo de la asignatura', {
      group_id,
      error: error.message,
      stack: error.stack,
    });

    // Si las cabeceras HTTP ya se enviaron, no podemos responder con JSON de error, cerramos la conexión abruptamente
    if (!res.headersSent) {
      res.statusCode = 500;
      return res.end(
        JSON.stringify({ error: 'Internal server error during export' })
      );
    }
    res.end();
  }
};
