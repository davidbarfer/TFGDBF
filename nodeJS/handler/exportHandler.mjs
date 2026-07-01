import { authenticate, query } from '../database.mjs';
import { logger } from '../logger.mjs';
import * as fastcsv from 'fast-csv';

export const exportPracticeGrades = async (req, res, params) => {
  // Captura de IDs desde la URL (Estructura dependiente de tu Regex del router)
  const practice_id = params[0].split('/')[2];
  try {
    // 1. Validar autenticación del Profesor mediante el token de los headers
    await authenticate(req, res);
    logger.info('Profesor solicitó exportación de notas con fast-csv', {
      practice_id,
    });

    const sql = `
    SELECT 
      u.id AS student_id,
      u.username AS student_username,
      u.name AS student_name,
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
      'Content-Disposition': `attachment; filename=notas_practica_${practice_id}.csv`,
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
        Nota: row.grade !== null ? row.grade : 'Sin evaluar',
        Fecha_Evaluación: row.graded_at || 'N/A',
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
