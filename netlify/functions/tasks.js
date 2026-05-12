const DEFAULT_LIST_ID = process.env.CLICKUP_LIST_ID
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

function parseMonto(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value
      .replace(/\s/g, "")
      .replace(/\$/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^0-9.-]/g, "");

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getMontoFromTask(task) {
  if (!task || !Array.isArray(task.custom_fields)) {
    return 0;
  }

  const montoField = task.custom_fields.find((field) => {
    if (!field || typeof field.name !== "string") {
      return false;
    }
    return field.name.trim().toLowerCase() === "monto con iva";
  });

  if (!montoField) {
    return 0;
  }

  return parseMonto(montoField.value);
}

async function fetchTasksForList(listId, apiKey) {
  const allTasks = [];
  let page = 0;
  let lastPage = false;

  while (!lastPage) {
    const url = `${CLICKUP_API_BASE}/list/${listId}/task?archived=false&subtasks=true&page=${page}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ClickUp request failed (${response.status}): ${text}`);
    }

    const payload = await response.json();
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
    allTasks.push(...tasks);

    lastPage = Boolean(payload.last_page);
    page += 1;

    if (tasks.length === 0) {
      break;
    }
  }

  return allTasks;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.CLICKUP_API_KEY;
  const listId = DEFAULT_LIST_ID;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing CLICKUP_API_KEY. Add it in Netlify environment variables."
      })
    };
  }

  try {
    const tasks = await fetchTasksForList(listId, apiKey);

    const normalizedTasks = tasks.map((task) => {
      const montoConIva = getMontoFromTask(task);
      return {
        id: task.id,
        name: task.name || "(sin nombre)",
        montoConIva
      };
    });

    const totalMontoConIva = normalizedTasks.reduce((sum, task) => sum + task.montoConIva, 0);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        listId,
        count: normalizedTasks.length,
        totalMontoConIva,
        tasks: normalizedTasks
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Could not load tasks from ClickUp",
        details: error.message
      })
    };
  }
};
