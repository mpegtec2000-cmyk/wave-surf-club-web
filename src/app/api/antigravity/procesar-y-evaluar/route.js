import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Inicializar el cliente de Anthropic con la clave de API de forma segura
// Nota: Asegúrate de configurar ANTHROPIC_API_KEY en tu archivo .env.local
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * --- FUNCIONES AUXILIARES PARA LLAMAR A LOS AGENTES ---
 */

/**
 * Llama al Agente Principal para generar la solución inicial
 */
async function llamarAgentePrincipal(tareaUsuario) {
  const systemPrompt = `Eres el Agente Principal de Antigravity para Wave Surf ERP. 
Tu tarea es generar una solución completa y funcional (código, texto, configuración) basada en la solicitud del usuario. 
Asegúrate de que la solución sea segura, eficiente y siga las mejores prácticas de desarrollo. 
Responde directamente con la solución sin introducciones innecesarias.`;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229", // O "claude-3-opus-20240229" para más potencia
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: "user", content: tareaUsuario },
    ],
  });

  return response.content[0].text;
}

/**
 * Llama al Agente Evaluador para verificar la solución generada
 */
async function llamarAgenteEvaluador(tareaUsuario, solucionGenerada) {
  const systemPrompt = `Eres el Agente Evaluador de Antigravity para Wave Surf ERP. 
Tu tarea es revisar críticamente la solución generada por el Agente Principal con respecto a la solicitud original del usuario. 
Evalúa la corrección, seguridad, eficiencia y adherencia a los requisitos. 
Responde SIEMPRE en formato JSON con dos campos:
  - "estado": "CORRECTO" o "INCORRECTO".
  - "explicacion": Una breve explicación de tu evaluación (especialmente si es INCORRECTO).
Solo devuelve el JSON, sin texto adicional.`;

  const userPrompt = `
    --- Solicitud Original del Usuario ---
    ${tareaUsuario}

    --- Solicitud Generada por el Agente Principal ---
    ${solucionGenerada}
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt },
    ],
  });

  try {
    // Intentamos extraer el JSON de la respuesta
    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error al parsear la respuesta del Agente Evaluador:", error);
    return { estado: "ERROR", explicacion: "No se pudo parsear la evaluación como JSON." };
  }
}

/**
 * --- MANEJADOR DE LA API ROUTE (POST) ---
 */
export async function POST(request) {
  // Verificar si la clave de API está configurada
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'La clave de API de Anthropic no está configurada en .env.local.' }, 
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { tarea } = body;

    // Validación básica
    if (!tarea) {
      return NextResponse.json({ error: 'El campo "tarea" es obligatorio.' }, { status: 400 });
    }

    console.log(`[Antigravity] Iniciando proceso para tarea: ${tarea.substring(0, 50)}...`);

    // 1. Llamar al Agente Principal para ejecutar la tarea
    console.log("[Antigravity] 1. Llamando al Agente Principal...");
    const solucionGenerada = await llamarAgentePrincipal(tarea);
    console.log("[Antigravity] -> Solución generada con éxito.");

    // 2. Llamar al Agente Evaluador para verificar el resultado
    console.log("[Antigravity] 2. Llamando al Agente Evaluador...");
    const evaluacion = await llamarAgenteEvaluador(tarea, solucionGenerada);
    console.log(`[Antigravity] -> Evaluación completada. Estado: ${evaluacion.estado}`);

    // 3. Enviar ambos resultados al frontend
    return NextResponse.json({
      solucion: solucionGenerada,
      evaluacion: evaluacion
    });

  } catch (error) {
    console.error('Error en API Route /api/antigravity/procesar-y-evaluar:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error interno en el servidor.', details: error.message }, 
      { status: 500 }
    );
  }
}
